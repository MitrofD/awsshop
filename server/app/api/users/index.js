// @flow
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const collection = require('./collections/users');
const loginsCollection = require('./collections/logins');
const monthPaymentsCollection = require('./collections/month-payments');
const monthRefPaymentsCollection = require('./collections/month-ref-payments');
const groupOrdersCollection = require('./collections/group-orders');
const ordersCollection = require('./collections/orders');
const paymentsCollection = require('./collections/payments');
const crm = require('../crm');
const products = require('../products');
const tools = require('../tools');
const { random, alphabet } = require('../random');
const uuid = require('../uuid');

const MS_IN_SEC = 1000;
const SEC_IN_MIN = 60;

const DEF_LIMIT = 100;
const MAX_LIMIT = 300;

const NOT_EXISTS_ACCOUNT_TEXT = 'Account does not exists';
const FAILED_CAPTCHA_TEXT = 'Captcha failed';
const NOT_EXISTS_TEXT = 'Email or password error';
const LINK_EXPIRE_TEXT = 'The link has expired';
const PASS_SALT_LENGTH = 5;

const IS_ADMIN_ATTR = 'isAdmin';
const PASSWORD_ATTR = 'password';
const PM_WALLET_ATTR = 'pMWallet';
const REFERRAL_CODE_ATTR = 'referralCode';

const REF_SOLD_QUANTITY = 'refSoldQuantity';
const REF_WAITING_PAYMENTS_ATTR = 'refWaitingPayments';
const WAITING_PAYMENTS_ATTR = 'waitingPayments';
const LAST_ACTION_TIME = 'lastActionTime';
const LAST_REF_ACTION_TIME = 'lastRefActionTime';

const PAYOUT_TIME_ATTR = 'payoutTime';
const REF_PAYOUT_TIME_ATTR = 'refPayoutTime';

const CONFIRM_TTL_MIN = 3;
const CONFIRM_TTL_SEC = SEC_IN_MIN * CONFIRM_TTL_MIN * MS_IN_SEC;

const getRefCode = async (): Promise<string> => {
  const code = random(alphabet.numbers, 8);

  const user = await collection.findOne({
    [REFERRAL_CODE_ATTR]: code,
  });

  if (user) {
    return getRefCode();
  }

  return code;
};

const getPurePasswordOrThrowError = (password: any): string => {
  if (typeof password === 'string') {
    const purePassword = password.trim();

    if (purePassword.length === 0) {
      throw new Error('Password is required');
    } else if (!Tools.passwordRegExp.test(purePassword)) {
      throw new Error('Password has to be least 8 characters with uppercase letters and numbers');
    }

    return purePassword;
  }

  throw new Error('Password has to be "string" type');
};

const getPureUSDPMWalletOrThrowError = (pMWallet: any): ?string => {
  const purePMWallet = typeof pMWallet === 'string' ? pMWallet.trim().toUpperCase() : '';

  if (purePMWallet.length === 0) {
    return null;
  }

  if (!Tools.USDPMWalletRegExp.test(purePMWallet)) {
    throw new Error('USD wallet is incorrect');
  }

  return purePMWallet;
};

const getHashedPasswordFromPlainText = async (plainText: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainText, PASS_SALT_LENGTH, (err, hash) => {
      if (err) {
        reject(new Error('Password generation failed'));
        return;
      }

      resolve(hash);
    });
  });
};

const getPayoutFromEarnings = (earnings: number) => {
  const payout = earnings / 2;
  return payout;
};

const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  const comparePromise = new Promise((resolve) => {
    bcrypt.compare(plainPassword, hashedPassword, (err, res) => {
      if (err) {
        resolve(false);
        return;
      }

      resolve(res);
    });
  });

  return comparePromise;
};

const genVerificationCode = uuid.v4;

const generateVerificationData = (time?: Date): VerificationData => {
  const rTime = time || new Date();

  return {
    date: rTime,
    code: genVerificationCode(),
  };
};

const throwErrorIfRetryLinkMinThenLimit = (date: Date, tNow?: Date) => {
  const rTimeNow = tNow || new Date();
  const diffTime = (rTimeNow.getTime() - date.getTime()) / MS_IN_SEC;

  if (diffTime < CONFIRM_TTL_SEC) {
    const min = parseInt(diffTime / SEC_IN_MIN);
    const minRem = CONFIRM_TTL_MIN - min;
    throw new Error(`The message has been sent, you can re-try in ${Math.max(minRem, 1)} minutes`);
  }
};

const throwErrorIfLinkExpired = (date: Date, tNow?: Date) => {
  const rTimeNow = tNow || new Date();
  const diffTime = (rTimeNow.getTime() - date.getTime()) / MS_IN_SEC;

  if (diffTime > CONFIRM_TTL_SEC) {
    throw new Error(LINK_EXPIRE_TEXT);
  }
};

const hasError = (obj: Object) => Object.keys(obj).length > 0;

const getPureSkip = (mbSkip: any) => parseInt(mbSkip) || 0;

const getPureLimit = (mbLimit: any) => {
  const pureLimit = parseInt(mbLimit);

  if (Number.isNaN(pureLimit)) {
    return DEF_LIMIT;
  }

  if (pureLimit > MAX_LIMIT) {
    return MAX_LIMIT;
  }

  return pureLimit;
};

const getMonthYearKey = (date: Date) => `${date.getMonth()}_${date.getFullYear()}`;

function getPayments(): Object[] {
  const pVal = this[WAITING_PAYMENTS_ATTR];

  if (Array.isArray(pVal)) {
    return pVal;
  }

  return [];
}

function getRefPayments(): Object {
  const pVal = this[REF_WAITING_PAYMENTS_ATTR];

  if (typeof pVal === 'object' && pVal !== null) {
    return pVal;
  }

  return {};
}

function getPaymentDataBefore(date: Date): Object {
  const time = date.getTime();
  const arr = getPayments.call(this);
  const crmDataArr: Object[] = [];
  let crmDataArrLength = crmDataArr.length;

  const arrLength = arr.length;
  let earnings = 0;
  let quantity = 0;
  let i = 0;

  for (; i < arrLength; i += 1) {
    const val = arr[i];

    if (val.t < time) {
      earnings += val.e;
      quantity += val.q;

      crmDataArr[crmDataArrLength] = {
        payout_amount: val.e,
        product_link: `${Config.url}/product/${val.i}`,
        request_date: val.t,
        approve_date: time,
      };

      crmDataArrLength += 1;
    } else {
      break;
    }
  }

  return {
    earnings,
    quantity,
    crmDataArr,
    remaining: arr.slice(i),
  };
}

function getRefPaymentData(): Object {
  const obj = getRefPayments.call(this);
  const userIds = Object.keys(obj);
  const keysLength = userIds.length;
  const rArr = [];
  const refPurchasePrice = Settings.getFloatOption('REF_PURCHASE_PRICE');
  let tQuantity = 0;
  let tEarnings = 0;
  let i = 0;

  for (; i < keysLength; i += 1) {
    const userId = userIds[i];
    const val = obj[userId];
    const quantity = val.q;
    const earnings = quantity * refPurchasePrice;

    rArr.push({
      earnings,
      quantity,
      userId,
      user: val.uF,
    });

    tQuantity += quantity;
    tEarnings += earnings;
  }

  return {
    earnings: tEarnings,
    quantity: tQuantity,
    items: rArr,
  };
}

const users = {
  NOT_EXISTS_ACCOUNT_TEXT,
  CONFIRM_TTL_SEC,
  CONFIRM_TTL_MIN,
  IS_ADMIN_ATTR,

  collection,
  loginsCollection,

  async checkPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(NOT_EXISTS_TEXT);
    }

    const isCorrectPassword = await comparePassword(password, user.password);

    if (!isCorrectPassword) {
      throw new Error('Incorrect password');
    }

    return true;
  },

  async forgotPassword(email: string): Promise<?User> {
    const user = await this.getByEmail(email);

    if (!user) {
      return null;
    }

    const verificationResetPassword: ?VerificationData = user.verificationResetPassword;
    const time = new Date();

    if (verificationResetPassword) {
      throwErrorIfRetryLinkMinThenLimit(verificationResetPassword.date, time);
    }

    const setObj = {
      verificationResetPassword: generateVerificationData(time),
    };

    await collection.updateOne({
      _id: user._id,
    }, {
      $set: setObj,
    });

    return Object.assign({}, user, setObj);
  },

  async has(): Promise<boolean> {
    const user = await collection.findOne({
      verification: {
        $exists: false,
      },
    });

    return !!user;
  },

  async get(query: any): Promise<Object> {
    const rQuery = tools.anyAsObj(query);
    const pureQuery = {};
    const pureSkip = getPureSkip(rQuery.skip);
    const pureLimit = getPureLimit(rQuery.limit);

    if (typeof rQuery.searchPattern === 'string') {
      const searchRegExpArr = [];
      const needRegExp = new RegExp(rQuery.searchPattern, 'i');

      [
        'firstName',
        'lastName',
        'email',
      ].forEach((sKey) => {
        const item = {
          [sKey]: {
            $regex: needRegExp,
          },
        };

        searchRegExpArr.push(item);
      });

      pureQuery.$or = searchRegExpArr;
    }

    const sortField = typeof rQuery.sortBy === 'string' ? rQuery.sortBy : 'createdAt';
    const sortDesc = parseInt(rQuery.sortDesc) || -1;

    const projection = {
      password: 0,
    };

    const findPromise = new Promise((resolve, reject) => {
      collection.find(pureQuery, {
        projection,
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort(sortField, sortDesc).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        let loadMore = false;

        if (items.length > pureLimit) {
          loadMore = true;
          items.pop();
        }

        resolve({
          items,
          loadMore,
          limit: pureLimit,
          skip: pureSkip,
        });
      });
    });

    return findPromise;
  },

  async refPaymentsHistory(query: any, userId: ?string = null): Promise<Object> {
    const rQuery = tools.anyAsObj(query);
    const pureQuery = {};
    const pureSkip = getPureSkip(rQuery.skip);
    const pureLimit = getPureLimit(rQuery.limit);

    if (typeof rQuery.searchPattern === 'string') {
      const needRegExp = new RegExp(rQuery.searchPattern, 'i');
      pureQuery.userName = {
        $regex: needRegExp,
      };
    }

    const updatedAtObj = {};
    const fromDate = tools.dateFromData(rQuery.from);
    const toDate = tools.dateFromData(rQuery.to);

    if (fromDate) {
      updatedAtObj.$gte = fromDate;
      pureQuery.updatedAt = updatedAtObj;
    }

    if (toDate) {
      updatedAtObj.$lte = toDate;
      pureQuery.updatedAt = updatedAtObj;
    }

    if (userId) {
      pureQuery.userId = userId;
    }

    const findPromise = new Promise((resolve, reject) => {
      monthRefPaymentsCollection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort('updatedAt', -1).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        let loadMore = false;

        if (items.length > pureLimit) {
          loadMore = true;
          items.pop();
        }

        resolve({
          items,
          loadMore,
          limit: pureLimit,
          skip: pureSkip,
        });
      });
    });

    return findPromise;
  },

  async getLoginsHistory(query: any): Promise<Object> {
    const rQuery = tools.anyAsObj(query);
    const pureQuery = {};
    const pureSkip = getPureSkip(rQuery.skip);
    const pureLimit = getPureLimit(rQuery.limit);

    if (typeof rQuery.searchPattern === 'string') {
      const searchRegExpArr = [];
      const needRegExp = new RegExp(rQuery.searchPattern, 'i');

      [
        'description',
        'userEmail',
      ].forEach((sKey) => {
        const item = {
          [sKey]: {
            $regex: needRegExp,
          },
        };

        searchRegExpArr.push(item);
      });

      pureQuery.$or = searchRegExpArr;
    }

    const createdAtObj = {};
    const fromDate = tools.dateFromData(rQuery.from);
    const toDate = tools.dateFromData(rQuery.to);

    if (fromDate) {
      createdAtObj.$gte = fromDate;
      pureQuery.createdAt = createdAtObj;
    }

    if (toDate) {
      createdAtObj.$lte = toDate;
      pureQuery.createdAt = createdAtObj;
    }

    const findPromise = new Promise((resolve, reject) => {
      loginsCollection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort('createdAt', -1).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        let loadMore = false;

        if (items.length > pureLimit) {
          loadMore = true;
          items.pop();
        }

        resolve({
          items,
          loadMore,
          limit: pureLimit,
          skip: pureSkip,
        });
      });
    });

    return findPromise;
  },

  async getById(userId: string): Promise<?User> {
    let id = null;

    try {
      id = new ObjectID(userId);
    } catch (error) {
      return null;
    }

    return collection.findOne({
      _id: id,
    });
  },

  async getByEmail(email: string): Promise<?User> {
    return collection.findOne({
      email,
    });
  },

  getSafeUser(userData: User): Object {
    const safeData = {
      blocked: tools.has.call(userData, 'blockedTime'),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isAdmin: userData.isAdmin,
      isVerified: !tools.has.call(userData, 'verification'),
      productsCount: userData.pCount || 0,
      phone: userData.phone,
      [REFERRAL_CODE_ATTR]: userData[REFERRAL_CODE_ATTR],
      [PM_WALLET_ATTR]: userData[PM_WALLET_ATTR],
    };

    return safeData;
  },

  async isVerified(email: string): Promise<boolean> {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new Error(NOT_EXISTS_ACCOUNT_TEXT);
    }

    return !user.verification;
  },

  async login(email: string, password: string, geoData?: GeoData): Promise<User> {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new Error(NOT_EXISTS_TEXT);
    }

    const isCorrectPassword = await comparePassword(password, user.password);

    if (!isCorrectPassword) {
      throw new Error(NOT_EXISTS_TEXT);
    }

    if (geoData) {
      const loginData = {
        ...geoData,
        description: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        createdAt: new Date(),
      };

      await loginsCollection.insertOne(loginData);
    }

    return user;
  },

  async registration(data: Object, asAdmin?: boolean): ErrorsPromise<User> {
    const pureData = typeof data === 'object' && data !== null ? data : {};

    const errors = {};
    const newUser = {};

    const requiredFields = [
      'email',
      'firstName',
      'lastName',
      PASSWORD_ATTR,
    ];

    const reqFieldsLength = requiredFields.length;
    let i = 0;

    for (; i < reqFieldsLength; i += 1) {
      const field = requiredFields[i];
      const val = typeof pureData[field] === 'string' ? pureData[field].trim() : '';
      newUser[field] = val;

      if (val.length === 0) {
        errors[field] = `${tools.capitalize(field)} is required`;
      }
    }

    if (newUser.email.length > 0 && !Tools.emailRegExp.test(newUser.email)) {
      errors.email = 'Email is incorrect';
    }

    const existsUser = await this.getByEmail(newUser.email);

    if (existsUser) {
      errors.email = 'Email is already registered';
    }

    let phone = typeof pureData.phone === 'string' ? pureData.phone.trim() : '';
    let purePhone: ?string = null;

    if (phone.length > 0) {
      purePhone = phone;

      if (!/^\d+$/.test(phone)) {
        errors.phone = 'Phone number is incorrect';
      }
    }

    newUser.phone = purePhone;

    const pureRefCode = typeof pureData.referralCode === 'string' ? pureData.referralCode.trim() : '';

    if (pureRefCode.length > 0) {
      const user = await collection.findOne({
        referralCode: pureRefCode,
      });

      if (user) {
        newUser.fromUser = user._id.toString();
      } else {
        errors.referralCode = 'Referral code is incorrect';
      }
    }

    let purePassword = '';

    try {
      purePassword = getPurePasswordOrThrowError(newUser.password);
    } catch (error) {
      errors[PASSWORD_ATTR] = error.message;
    }

    if (hasError(errors)) {
      return {
        errors,
      };
    }

    const nowTime = new Date();
    newUser[PASSWORD_ATTR] = await getHashedPasswordFromPlainText(purePassword);
    newUser[REFERRAL_CODE_ATTR] = await getRefCode();
    newUser[IS_ADMIN_ATTR] = !!asAdmin;
    newUser.verification = genVerificationCode();
    newUser.createdAt = nowTime;
    newUser[PM_WALLET_ATTR] = null;
    newUser[REF_SOLD_QUANTITY] = 0;
    newUser[LAST_ACTION_TIME] = nowTime;
    newUser[LAST_REF_ACTION_TIME] = nowTime;
    newUser[PAYOUT_TIME_ATTR] = nowTime;
    newUser[REF_PAYOUT_TIME_ATTR] = nowTime;

    const insertRes = await collection.insertOne(newUser);
    newUser._id = insertRes.insertedId;

    return {
      data: newUser,
    };
  },

  async resetPassword(userId: string, verificationCode: string, password: string): Promise<User> {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(NOT_EXISTS_ACCOUNT_TEXT);
    }

    const verificationResetPassword: ?VerificationData = user.verificationResetPassword;

    if (!verificationResetPassword) {
      throw new Error(LINK_EXPIRE_TEXT);
    }

    throwErrorIfLinkExpired(verificationResetPassword.date);

    if (verificationResetPassword.code !== verificationCode) {
      throw new Error(FAILED_CAPTCHA_TEXT);
    }

    const purePassword = getPurePasswordOrThrowError(password);
    const hashedPassword = await getHashedPasswordFromPlainText(purePassword);

    await collection.updateOne({
      _id: user._id,
    }, {
      $set: {
        [PASSWORD_ATTR]: hashedPassword,
      },
      $unset: {
        verificationResetPassword: '',
      },
    });

    return user;
  },

  async saleProduct(pId: MongoID, mbOptions: any): Promise<Object> {
    const options = typeof mbOptions === 'object' && mbOptions !== null ? mbOptions : {};
    const product = await products.withId(pId);

    if (!product.isApproved) {
      throw new Error('Product is not approved');
    }

    const nowTime = new Date();
    const time = typeof options.time === 'number' ? new Date(options.time) : nowTime;
    const user = await this.getById(product.userId);
    const userId = user._id.toString();
    const pQuantity = parseInt(options.quantity) || 1;
    const currEarnings = pQuantity * product.earnings;

    const currPaymentsArr = getPayments.call(user);

    currPaymentsArr[currPaymentsArr.length] = {
      t: time.getTime(),
      e: currEarnings,
      q: pQuantity,
      i: product._id.toString(),
    };

    const setObj = {
      [LAST_ACTION_TIME]: nowTime,
      [WAITING_PAYMENTS_ATTR]: currPaymentsArr,
    };

    const promisesArr = [];
    let promisesArrLength = promisesArr.length;

    if (typeof user.fromUser === 'string') {
      let refUser = null;

      try {
        refUser = await this.getById(user.fromUser);
        // eslint-disable-next-line no-empty
      } catch (getRefError) {}

      if (refUser) {
        const refCurrPayments = getRefPayments.call(refUser);
        const exVal = refCurrPayments[userId];
        let refQuntity = pQuantity;

        if (typeof exVal === 'object' && exVal !== null) {
          refQuntity += exVal.q;
        }

        refCurrPayments[userId] = {
          uF: `${user.firstName} ${user.lastName}`,
          q: refQuntity,
        };

        const refUpdatePromise = collection.updateOne({
          _id: refUser._id,
        }, {
          $set: {
            [LAST_REF_ACTION_TIME]: nowTime,
            [REF_WAITING_PAYMENTS_ATTR]: refCurrPayments,
          },

          $inc: {
            [REF_SOLD_QUANTITY]: pQuantity,
          },
        });

        promisesArr[promisesArrLength] = refUpdatePromise;
        promisesArrLength += 1;
      }
    }

    const insertData = Object.assign({}, options);
    delete insertData.quantity;
    delete insertData.time;
    const productId = product._id.toString();
    const payout = getPayoutFromEarnings(currEarnings);
    insertData.userId = userId;
    insertData.createdAt = nowTime;
    insertData.earnings = currEarnings;
    insertData.image = product.image;
    insertData.productId = productId;
    insertData.price = product.price;
    insertData.title = product.title;
    insertData.quantity = pQuantity;
    insertData.payout = payout;

    const addToOrdersPromise = ordersCollection.insertOne(insertData);
    promisesArr[promisesArrLength] = addToOrdersPromise;
    promisesArrLength += 1;

    const addToGroupOrdersPromise = groupOrdersCollection.updateOne({
      productId,
    }, {
      $set: {
        userId,
        image: insertData.image,
        price: insertData.price,
        title: insertData.title,
        updatedAt: nowTime,
      },
      $inc: {
        payout,
        quantity: pQuantity,
        earnings: currEarnings,
      },
    }, {
      upsert: true,
    });

    promisesArr[promisesArrLength] = addToGroupOrdersPromise;
    promisesArrLength += 1;

    const genPromise = collection.updateOne({
      _id: user._id,
    }, {
      $set: setObj,
    }, {
      returnOriginal: false,
    });

    promisesArr[promisesArrLength] = genPromise;
    promisesArrLength += 1;

    await Promise.all(promisesArr);
    return insertData;
  },

  /*
  async soldProductInQuantities(productId: MongoID, quantity?: any): Promise<User> {
    const product = await products.withId(productId);

    if (!product.isApproved) {
      throw new Error('Product is not approved');
    }

    const nowTime = new Date();
    const nowTimeMS = nowTime.getTime();
    const user = await this.getById(product.userId);
    const userId = user._id.toString();
    const pQuantity = parseInt(quantity) || 1;
    const currEarnings = pQuantity * product.earnings;

    const currPaymentsArr = getPayments.call(user);
    currPaymentsArr[currPaymentsArr.length] = {
      t: nowTimeMS,
      e: currEarnings,
      q: pQuantity,
    };

    const setObj = {
      [LAST_ACTION_TIME]: nowTime,
      [WAITING_PAYMENTS_ATTR]: currPaymentsArr,
    };

    const promisesArr = [];
    let promisesArrLength = promisesArr.length;

    if (typeof user.fromUser === 'string') {
      let refUser = null;

      try {
        refUser = await this.getById(user.fromUser);
        // eslint-disable-next-line no-empty
      } catch (getRefError) {}

      if (refUser) {
        const refCurrPayments = getRefPayments.call(refUser);
        const exVal = refCurrPayments[userId];
        let refQuntity = pQuantity;

        if (typeof exVal === 'object' && exVal !== null) {
          refQuntity += exVal.q;
        }

        refCurrPayments[userId] = {
          uF: `${user.firstName} ${user.lastName}`,
          q: refQuntity,
        };

        const refUpdatePromise = collection.updateOne({
          _id: refUser._id,
        }, {
          $set: {
            [LAST_REF_ACTION_TIME]: nowTime,
            [REF_WAITING_PAYMENTS_ATTR]: refCurrPayments,
          },

          $inc: {
            [REF_SOLD_QUANTITY]: pQuantity,
          },
        });

        promisesArr[promisesArrLength] = refUpdatePromise;
        promisesArrLength += 1;
      }
    }

    const addToOrdersPromise = ordersCollection.insertOne({
      userId,
      createdAt: nowTime,
      earnings: currEarnings,
      image: product.image,
      productId: product._id.toString(),
      price: product.price,
      title: product.title,
      quantity: pQuantity,
    });

    promisesArr[promisesArrLength] = addToOrdersPromise;
    promisesArrLength += 1;

    const genPromise = collection.updateOne({
      _id: user._id,
    }, {
      $set: setObj,
    }, {
      returnOriginal: false,
    });

    promisesArr[promisesArrLength] = genPromise;
    promisesArrLength += 1;

    await Promise.all(promisesArr);
    Object.assign(user, setObj);

    return user;
  },
  */

  async getSoldProductHistory(userId: string, productId: string, query: any): Promise<Object> {
    const rQuery = tools.anyAsObj(query);
    const pureQuery = {};
    const pureSkip = getPureSkip(rQuery.skip);
    const pureLimit = getPureLimit(rQuery.limit);
    pureQuery.userId = userId;
    pureQuery.productId = productId;

    const createdAtObj = {};
    const fromDate = tools.dateFromData(rQuery.from);
    const toDate = tools.dateFromData(rQuery.to);

    if (fromDate) {
      createdAtObj.$gte = fromDate;
      pureQuery.createdAt = createdAtObj;
    }

    if (toDate) {
      createdAtObj.$lte = toDate;
      pureQuery.createdAt = createdAtObj;
    }

    if (typeof rQuery.searchPattern === 'string') {
      const needRegExp = new RegExp(rQuery.searchPattern, 'i');

      pureQuery.title = {
        $regex: needRegExp,
      };
    }

    const findPromise = new Promise((resolve, reject) => {
      ordersCollection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort('createdAt', -1).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        let loadMore = false;

        if (items.length > pureLimit) {
          loadMore = true;
          items.pop();
        }

        resolve({
          items,
          loadMore,
          limit: pureLimit,
          skip: pureSkip,
        });
      });
    });

    return findPromise;
  },

  async getSoldProducts(userId: string, query: any): Promise<Object> {
    const rQuery = tools.anyAsObj(query);
    const pureQuery = {};
    const pureSkip = getPureSkip(rQuery.skip);
    const pureLimit = getPureLimit(rQuery.limit);
    pureQuery.userId = userId;

    const createdAtObj = {};
    const fromDate = tools.dateFromData(rQuery.from);
    const toDate = tools.dateFromData(rQuery.to);

    if (fromDate) {
      createdAtObj.$gte = fromDate;
      pureQuery.updatedAt = createdAtObj;
    }

    if (toDate) {
      createdAtObj.$lte = toDate;
      pureQuery.updatedAt = createdAtObj;
    }

    if (typeof rQuery.searchPattern === 'string') {
      const needRegExp = new RegExp(rQuery.searchPattern, 'i');

      pureQuery.title = {
        $regex: needRegExp,
      };
    }

    const findPromise = new Promise((resolve, reject) => {
      groupOrdersCollection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort('updatedAt', -1).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        let loadMore = false;

        if (items.length > pureLimit) {
          loadMore = true;
          items.pop();
        }

        resolve({
          items,
          loadMore,
          limit: pureLimit,
          skip: pureSkip,
        });
      });
    });

    return findPromise;
  },

  async getPayments(userId: string, query: any): Promise<Object> {
    const rQuery = tools.anyAsObj(query);
    const pureQuery = {};
    const pureSkip = getPureSkip(rQuery.skip);
    const pureLimit = getPureLimit(rQuery.limit);

    pureQuery.userId = userId;

    const createdAtObj = {};
    const fromDate = tools.dateFromData(rQuery.from);
    const toDate = tools.dateFromData(rQuery.to);

    if (fromDate) {
      createdAtObj.$gte = fromDate;
      pureQuery.createdAt = createdAtObj;
    }

    if (toDate) {
      createdAtObj.$lte = toDate;
      pureQuery.createdAt = createdAtObj;
    }

    const findPromise = new Promise((resolve, reject) => {
      paymentsCollection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort('createdAt', -1).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        let loadMore = false;

        if (items.length > pureLimit) {
          loadMore = true;
          items.pop();
        }

        resolve({
          items,
          loadMore,
          limit: pureLimit,
          skip: pureSkip,
        });
      });
    });

    return findPromise;
  },

  async getPaymentsByMonth(userId: string, query: any): Promise<Object> {
    const rQuery = tools.anyAsObj(query);
    const pureQuery = {};
    const pureSkip = getPureSkip(rQuery.skip);
    const pureLimit = getPureLimit(rQuery.limit);

    pureQuery.userId = userId;

    const createdAtObj = {};
    const fromDate = tools.dateFromData(rQuery.from);
    const toDate = tools.dateFromData(rQuery.to);

    if (fromDate) {
      createdAtObj.$gte = fromDate;
      pureQuery.updatedAt = createdAtObj;
    }

    if (toDate) {
      createdAtObj.$lte = toDate;
      pureQuery.updatedAt = createdAtObj;
    }

    const findPromise = new Promise((resolve, reject) => {
      monthPaymentsCollection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort('updatedAt', -1).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        let loadMore = false;

        if (items.length > pureLimit) {
          loadMore = true;
          items.pop();
        }

        resolve({
          items,
          loadMore,
          limit: pureLimit,
          skip: pureSkip,
        });
      });
    });

    return findPromise;
  },

  async waitingForPayment(userId: MongoID): Promise<number> {
    const user = await this.getById(userId);
    const nowTime = new Date();
    const paymentData = getPaymentDataBefore.call(user, nowTime);
    return paymentData.earnings;
  },

  async refWaitingForPayment(userId: MongoID): Promise<number> {
    const user = await this.getById(userId);
    const pQuantity = parseInt(user[REF_SOLD_QUANTITY]) || 0;
    const refPurchPrice = Settings.getFloatOption('REF_PURCHASE_PRICE');
    const earnings = pQuantity * refPurchPrice;
    return earnings;
  },

  async paymentCurr(userId: MongoID): Promise<User> {
    const user = await this.getById(userId);
    const nowTime = new Date();
    const paymentData = getPaymentDataBefore.call(user, nowTime);

    if (paymentData.earnings === 0) {
      throw new Error('User don\'t have earnings');
    }

    const monthYearKey = getMonthYearKey(nowTime);
    const pUserId = user._id.toString();

    const dbPaymentData = {
      earnings: paymentData.earnings,
      quantity: paymentData.quantity,
    };

    const genPromise = collection.updateOne({
      _id: user._id,
    }, {
      $set: {
        [PAYOUT_TIME_ATTR]: nowTime,
        [WAITING_PAYMENTS_ATTR]: paymentData.remaining,
      },
    });

    const paymentPromise = paymentsCollection.insertOne({
      ...dbPaymentData,
      createdAt: nowTime,
      userId: pUserId,
    });

    const monthPaymentPromise = monthPaymentsCollection.updateOne({
      monthYear: monthYearKey,
      userId: pUserId,
    }, {
      $set: {
        updatedAt: nowTime,
      },

      $inc: dbPaymentData,
    }, {
      upsert: true,
    });

    await Promise.all([
      genPromise,
      paymentPromise,
      monthPaymentPromise,
    ]);

    user[PAYOUT_TIME_ATTR] = nowTime;
    user[WAITING_PAYMENTS_ATTR] = paymentData.remaining;
    crm.payout(paymentData.crmDataArr).catch(Tools.emptyRejectExeption);
    return user;
  },

  async payment(userId: MongoID, otsdMode: boolean): Promise<User> {
    const user = await this.getById(userId);

    const startOfMonthDate = Tools.startOfMonthDate();

    if (otsdMode) {
      startOfMonthDate.setDate(user.payoutTime.getDate() - 1);
    }

    const paymentData = getPaymentDataBefore.call(user, startOfMonthDate);

    if (paymentData.earnings === 0) {
      throw new Error('User don\'t have earnings');
    }

    const nowTime = new Date();
    const monthYearKey = getMonthYearKey(nowTime);
    const pUserId = user._id.toString();

    const dbPaymentData = {
      earnings: paymentData.earnings,
      quantity: paymentData.quantity,
    };

    const genPromise = collection.updateOne({
      _id: user._id,
    }, {
      $set: {
        [PAYOUT_TIME_ATTR]: nowTime,
        [WAITING_PAYMENTS_ATTR]: paymentData.remaining,
      },
    });

    const paymentPromise = paymentsCollection.insertOne({
      ...dbPaymentData,
      createdAt: nowTime,
      userId: pUserId,
    });

    const monthPaymentPromise = monthPaymentsCollection.updateOne({
      monthYear: monthYearKey,
      userId: pUserId,
    }, {
      $set: {
        updatedAt: nowTime,
      },

      $inc: dbPaymentData,
    }, {
      upsert: true,
    });

    await Promise.all([
      genPromise,
      paymentPromise,
      monthPaymentPromise,
    ]);

    user[PAYOUT_TIME_ATTR] = nowTime;
    user[WAITING_PAYMENTS_ATTR] = paymentData.remaining;
    crm.payout(paymentData.crmDataArr).catch(Tools.emptyRejectExeption);
    return user;
  },

  async refPayment(userId: MongoID): Promise<User> {
    const user = await this.getById(userId);
    const paymentData = getRefPaymentData.call(user);

    if (paymentData.earnings === 0) {
      throw new Error('User don\'t have referral earnings');
    }

    const nowTime = new Date();
    const pUserId = user._id.toString();
    const monthYearKey = getMonthYearKey(nowTime);

    const prevMonthPayment = await monthRefPaymentsCollection.findOne({
      monthYear: monthYearKey,
      userId: pUserId,
    });

    const allPromises = [];

    const insertIncData = {
      quantity: paymentData.quantity,
      earnings: paymentData.earnings,
    };

    if (prevMonthPayment) {
      const newItems = prevMonthPayment.items.concat(paymentData.items);

      const updatePromise = monthRefPaymentsCollection.updateOne({
        _id: prevMonthPayment._id,
      }, {
        $set: {
          items: newItems,
          updatedAt: nowTime,
        },

        $inc: insertIncData,
      });

      allPromises.push(updatePromise);
    } else {
      const insertPromise = monthRefPaymentsCollection.insertOne({
        ...insertIncData,
        userName: `${user.firstName} ${user.lastName}`,
        userId: pUserId,
        updatedAt: nowTime,
        monthYear: monthYearKey,
        items: paymentData.items,
      });

      allPromises.push(insertPromise);
    }

    /*
    const insertToHistoryPromise = refPaymentsCollection.insertOne({
      ...insertData,
      createdAt: nowTime,
      userId: pUserId,
    });
    */

    const setObj = {
      [REF_SOLD_QUANTITY]: 0,
      [REF_PAYOUT_TIME_ATTR]: nowTime,
    };

    const getUpdatePromise = collection.updateOne({
      _id: user._id,
    }, {
      $set: setObj,
      $unset: {
        REF_WAITING_PAYMENTS_ATTR: '',
      },
    });

    allPromises.push(getUpdatePromise);
    await Promise.all(allPromises);

    delete user[REF_WAITING_PAYMENTS_ATTR];
    Object.assign(user, setObj);

    return user;
  },

  async update(id: MongoID, updateData: Object, asAdmin: boolean = false): ErrorsPromise<User> {
    const errors = {};
    const setObject = {};

    if (asAdmin) {
      if (tools.has.call(updateData, IS_ADMIN_ATTR)) {
        setObject[IS_ADMIN_ATTR] = !!updateData[IS_ADMIN_ATTR];
      }
    }

    if (tools.has.call(updateData, PM_WALLET_ATTR)) {
      try {
        setObject[PM_WALLET_ATTR] = getPureUSDPMWalletOrThrowError(updateData[PM_WALLET_ATTR]);
      } catch (error) {
        errors[PM_WALLET_ATTR] = error.message;
      }
    }

    if (tools.has.call(updateData, PASSWORD_ATTR)) {
      try {
        const purePassword = getPurePasswordOrThrowError(updateData[PASSWORD_ATTR]);
        setObject[PASSWORD_ATTR] = await getHashedPasswordFromPlainText(purePassword);
      } catch (error) {
        errors[PASSWORD_ATTR] = error.message;
      }
    }

    if (hasError(errors)) {
      return {
        errors,
      };
    }

    const { value } = await collection.findOneAndUpdate({
      _id: tools.getMongoID(id),
    }, {
      $set: setObject,
    }, {
      returnOriginal: false,
    });

    if (typeof value !== 'object' || value === null) {
      throw new Error(NOT_EXISTS_ACCOUNT_TEXT);
    }

    return value;
  },

  async verification(userId: string, verificationCode: string): Promise<boolean> {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(NOT_EXISTS_ACCOUNT_TEXT);
    }

    if (!user.verification) {
      return true;
    }

    if (user.verification !== verificationCode) {
      return false;
    }

    await collection.updateOne({
      _id: user._id,
    }, {
      $unset: {
        verification: '',
      },
    });

    return true;
  },
};

module.exports = users;
