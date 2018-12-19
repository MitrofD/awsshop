// @flow
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const collection = require('./collections/users');
const tools = require('../tools');
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
const ETH_ADDRESS_ATTR = 'ethAddress';
const PASSWORD_ATTR = 'password';

const CONFIRM_TTL_MIN = 3;
const CONFIRM_TTL_SEC = SEC_IN_MIN * CONFIRM_TTL_MIN * MS_IN_SEC;

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

const getPureEthAddressOrThrowError = (ethAddress: any): string => {
  if (typeof ethAddress === 'string') {
    const pureEthAddress = ethAddress.trim();

    if (pureEthAddress.length === 0) {
      throw new Error('ETH address is required');
    } else if (!Tools.ethAdressRegExp.test(pureEthAddress)) {
      throw new Error('ETH address is incorrect');
    }

    return pureEthAddress;
  }

  throw new Error('ETH address has to be "string" type');
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

const users = {
  NOT_EXISTS_ACCOUNT_TEXT,
  CONFIRM_TTL_SEC,
  CONFIRM_TTL_MIN,

  collection,

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
    const rQuery = typeof query === 'object' && query !== null ? query : {};
    const pureQuery = {};
    const pureSkip = parseInt(rQuery.skip) || 0;
    let pureLimit = parseInt(rQuery.limit);

    if (Number.isNaN(pureLimit)) {
      pureLimit = DEF_LIMIT;
    } else if (pureLimit > MAX_LIMIT) {
      pureLimit = MAX_LIMIT;
    }

    if (typeof rQuery.emailPattern === 'string') {
      pureQuery.email = {
        $regex: new RegExp(rQuery.emailPattern, 'i'),
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
          items.pop();
          loadMore = true;
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
      ethAddress: userData.ethAddress,
      isAdmin: userData.isAdmin,
      isVerified: !tools.has.call(userData, 'verification'),
      productsCount: userData.pCount || 0,
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

  async login(email: string, password: string): Promise<User> {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new Error(NOT_EXISTS_TEXT);
    }

    const isCorrectPassword = await comparePassword(password, user.password);

    if (!isCorrectPassword) {
      throw new Error(NOT_EXISTS_TEXT);
    }

    return user;
  },

  async registration(email: string, password: string, ethAddress: string, asAdmin?: boolean): ErrorsPromise<User> {
    let errors = {};
    const newUser = {};
    newUser.email = email.trim();

    if (newUser.email.length === 0) {
      errors.email = 'Email is required';
    } else if (!Tools.emailRegExp.test(newUser.email)) {
      errors.email = 'Email is ncorrect';
    }

    const existsUser = await this.getByEmail(newUser.email);

    if (existsUser) {
      errors.email = 'Email is already registered';
    }

    try {
      newUser[ETH_ADDRESS_ATTR] = getPureEthAddressOrThrowError(ethAddress);
    } catch (error) {
      errors[ETH_ADDRESS_ATTR] = error.message;
    }

    let purePassword = '';

    try {
      purePassword = getPurePasswordOrThrowError(password);
    } catch (error) {
      errors[PASSWORD_ATTR] = error.message;
    }

    if (hasError(errors)) {
      return {
        errors,
      };
    }

    newUser[IS_ADMIN_ATTR] = !!asAdmin;
    newUser[PASSWORD_ATTR] = await getHashedPasswordFromPlainText(purePassword);
    newUser.verification = genVerificationCode();
    newUser.createdAt = new Date();

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

  async update(id: MongoID, updateData: Object): ErrorsPromise<User> {
    let errors = {};
    const setObject = {};

    if (tools.has.call(updateData, IS_ADMIN_ATTR)) {
      setObject[IS_ADMIN_ATTR] = !!updateData[IS_ADMIN_ATTR];
    }

    if (tools.has.call(updateData, ETH_ADDRESS_ATTR)) {
      try {
        setObject[ETH_ADDRESS_ATTR] = getPureEthAddressOrThrowError(updateData[ETH_ADDRESS_ATTR]);
      } catch (error) {
        errors[ETH_ADDRESS_ATTR] = error.message;
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
