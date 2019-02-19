// @flow
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const collection = require('./collections/users');
const loginsCollection = require('./collections/logins');
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
const LAST_EARNINGS_ATTR = 'lEarnings';
const LAST_SOLD_QUANTITY_ATTR = 'lQSold';
const LAST_REF_SOLD_QUANTITY_ATTR = 'lRefQSold';
const LAST_PAYOUT_TIME_ATTR = 'lPayoutTime';
const PASSWORD_ATTR = 'password';
const PM_WALLET_ATTR = 'pMWallet';
const TOTAL_EARNINGS_ATTR = 'tEarnings';
const TOTAL_REF_EARNINGS_ATTR = 'tRefEarnings';
const TOTAL_REF_SOLD_ATTR = 'tRefSold';
const REF_CODE_ATTR = 'referralCode';

const CONFIRM_TTL_MIN = 3;
const CONFIRM_TTL_SEC = SEC_IN_MIN * CONFIRM_TTL_MIN * MS_IN_SEC;

const getRefCode = async (): Promise<string> => {
  const code = random(alphabet.numbers, 8);

  const user = await collection.findOne({
    [REF_CODE_ATTR]: code,
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

const getPureUSDPMWalletOrThrowError = (pMWallet: any): string => {
  const purePMWallet = typeof pMWallet === 'string' ? pMWallet.trim().toUpperCase() : '';

  if (purePMWallet.length === 0) {
    throw new Error('USD wallet is required');
  } else if (!Tools.USDPMWalletRegExp.test(purePMWallet)) {
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
  } else if (pureLimit > MAX_LIMIT) {
    return MAX_LIMIT;
  }

  return pureLimit;
};

const users = {
  NOT_EXISTS_ACCOUNT_TEXT,
  CONFIRM_TTL_SEC,
  CONFIRM_TTL_MIN,

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
      pureQuery.email = {
        $regex: new RegExp(rQuery.searchPattern, 'i'),
      };
    }

    const projection = {
      password: 0,
    };

    const findPromise = new Promise((resolve, reject) => {
      collection.find(pureQuery, {
        projection,
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

  async getInvitedUsers(userId: string, query: any): Promise<Object> {
    const rQuery = tools.anyAsObj(query);
    const pureQuery = {};
    const pureSkip = getPureSkip(rQuery.skip);
    const pureLimit = getPureLimit(rQuery.limit);

    if (typeof rQuery.searchPattern === 'string') {
      const searchRegExpArr = [];
      const needRegExp = new RegExp(rQuery.searchPattern, 'i');

      [
        'email',
        'firstName',
        'lastName',
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

    pureQuery.fromUser = userId;

    const findPromise = new Promise((resolve, reject) => {
      collection.find(pureQuery, {
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
      [REF_CODE_ATTR]: userData[REF_CODE_ATTR],
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
    const skipVal = 0;
    newUser[PASSWORD_ATTR] = await getHashedPasswordFromPlainText(purePassword);
    newUser[REF_CODE_ATTR] = await getRefCode();
    newUser[IS_ADMIN_ATTR] = !!asAdmin;
    newUser.verification = genVerificationCode();
    newUser.createdAt = nowTime;
    newUser[LAST_EARNINGS_ATTR] = skipVal;
    newUser[TOTAL_EARNINGS_ATTR] = skipVal;
    newUser[TOTAL_REF_EARNINGS_ATTR] = skipVal;
    newUser[TOTAL_REF_SOLD_ATTR] = skipVal;
    newUser[LAST_SOLD_QUANTITY_ATTR] = skipVal;
    newUser[LAST_REF_SOLD_QUANTITY_ATTR] = skipVal;
    newUser[LAST_PAYOUT_TIME_ATTR] = nowTime;
    newUser[PM_WALLET_ATTR] = null;

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

  async soldProductInQuantities(productId: MongoID, quantity?: any): Promise<User> {
    const pQuantity = parseInt(quantity) || 1;
    const product = await products.withId(productId);

    if (!product.isApproved) {
      throw new Error('Product is not approved');
    }

    const tEarnings = pQuantity * product.earnings;
    const pUserId = tools.getMongoID(product.userId);

    const { value } = await collection.findOneAndUpdate({
      _id: pUserId,
    }, {
      $inc: {
        [LAST_EARNINGS_ATTR]: tEarnings,
        [LAST_SOLD_QUANTITY_ATTR]: pQuantity,
        [LAST_REF_SOLD_QUANTITY_ATTR]: pQuantity,
      },
    }, {
      returnOriginal: false,
    });

    if (typeof value.fromUser === 'string') {
      await collection.updateOne({
        _id: tools.getMongoID(value.fromUser),
      }, {
        $inc: {
          [TOTAL_REF_SOLD_ATTR]: pQuantity,
        },
      });
    }

    return value;
  },

  async payment(userId: MongoID): Promise<User> {
    const user = await this.getById(userId);
    const skipVal = 0;
    const now = new Date();

    const setObj = {
      [LAST_EARNINGS_ATTR]: skipVal,
      [LAST_SOLD_QUANTITY_ATTR]: skipVal,
      [LAST_PAYOUT_TIME_ATTR]: now,
    };

    const lastEarnings = user[LAST_EARNINGS_ATTR];

    const incObj = {
      [TOTAL_EARNINGS_ATTR]: lastEarnings,
    };

    await collection.updateOne({
      _id: user._id,
    }, {
      $set: setObj,
      $inc: incObj,
    });

    user[LAST_EARNINGS_ATTR] = skipVal;
    user[LAST_SOLD_QUANTITY_ATTR] = skipVal;
    user[LAST_PAYOUT_TIME_ATTR] = now;
    user[TOTAL_EARNINGS_ATTR] += lastEarnings;

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
