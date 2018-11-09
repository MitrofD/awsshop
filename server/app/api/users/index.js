// @flow
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const collection = require('./collections/users');
const tools = require('../tools');
const userRoles = require('../user-roles');
const uuid = require('../uuid');

const MS_IN_SEC = 1000;
const SEC_IN_MIN = 60;

const accountNotExistsText = 'Account does not exists';
const captchaFailedText = 'Captcha failed';
const notExistsText = 'Email or password error';
const linkExpireText = 'The link has expired';
const passwordSaltLength = 5;

const confirmTTLMin = 3;
const confirmTTLSec = SEC_IN_MIN * confirmTTLMin * MS_IN_SEC;

const getPurePasswordOrThrowError = (plainPassword: string): string => {
  const cleanPlainPassword = plainPassword.trim();

  if (cleanPlainPassword.length === 0) {
    throw new Error('Password is required');
  } else if (!Tools.passwordRegExp.test(cleanPlainPassword)) {
    throw new Error('Password has to be least 8 characters with uppercase letters and numbers');
  }

  return cleanPlainPassword;
};

const getHashedPasswordFromPlainText = async (plainText: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainText, passwordSaltLength, (err, hash) => {
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

  if (diffTime < confirmTTLSec) {
    const min = parseInt(diffTime / SEC_IN_MIN);
    const minRem = confirmTTLMin - min;
    throw new Error(`The message has been sent, you can re-try in ${Math.max(minRem, 1)} minutes`);
  }
};

const throwErrorIfLinkExpired = (date: Date, tNow?: Date) => {
  const rTimeNow = tNow || new Date();
  const diffTime = (rTimeNow.getTime() - date.getTime()) / MS_IN_SEC;

  if (diffTime > confirmTTLSec) {
    throw new Error(linkExpireText);
  }
};

const hasError = (obj: Object) => Object.keys(obj).length > 0;

const users = {
  accountNotExistsText,
  confirmTTLSec,
  confirmTTLMin,

  async checkPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(notExistsText);
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
      email: userData.email,
      frozen: tools.has.call(userData, 'freezingTime'),
      googleAuthRequired: tools.has.call(userData, 'googleSecret'),
      isAdmin: userData.role === userRoles.TYPE.ADMIN,
      isVerified: !tools.has.call(userData, 'verification'),
    };

    return safeData;
  },

  async isVerified(email: string): Promise<boolean> {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new Error(accountNotExistsText);
    }

    return !user.verification;
  },

  async login(email: string, password: string): Promise<User> {
    const user = await this.getByEmail(email);

    if (!user) {
      throw new Error(notExistsText);
    }

    const isCorrectPassword = await comparePassword(password, user.password);

    if (!isCorrectPassword) {
      throw new Error(notExistsText);
    }

    return user;
  },

  async verification(userId: string, verificationCode: string): Promise<boolean> {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(accountNotExistsText);
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

  async registration(role: string, email: string, password: string, ethAddress: string): ErrorsPromise<User> {
    userRoles.check(role);

    let errors = {};
    const pureEmail = email.trim();

    if (pureEmail.length === 0) {
      errors.email = 'Email is required';
    } else if (!Tools.emailRegExp.test(pureEmail)) {
      errors.email = 'Email is ncorrect';
    }

    const existsUser = await this.getByEmail(pureEmail);

    if (existsUser) {
      errors.email = 'Email is already registered';
    }

    const pureETHAddress = ethAddress.trim();

    if (pureETHAddress.length === 0) {
      errors.ethAddress = 'ETH address is required';
    } else if (!Tools.ethAdressRegExp.test(pureETHAddress)) {
      errors.ethAddress = 'ETH address is incorrect';
    }

    let purePassword = '';

    try {
      purePassword = getPurePasswordOrThrowError(password);
    } catch (error) {
      errors.password = error.message;
    }

    if (hasError(errors)) {
      return {
        errors,
      };
    }

    const newUser = {};
    newUser.role = role;
    newUser.email = pureEmail;
    newUser.ethAddress = pureETHAddress;
    newUser.password = await getHashedPasswordFromPlainText(purePassword);
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
      throw new Error(accountNotExistsText);
    }

    const verificationResetPassword: ?VerificationData = user.verificationResetPassword;

    if (!verificationResetPassword) {
      throw new Error(linkExpireText);
    }

    throwErrorIfLinkExpired(verificationResetPassword.date);

    if (verificationResetPassword.code !== verificationCode) {
      throw new Error(captchaFailedText);
    }

    const purePassword = getPurePasswordOrThrowError(password);
    const hashedPassword = await getHashedPasswordFromPlainText(purePassword);

    await collection.updateOne({
      _id: user._id,
    }, {
      $set: {
        password: hashedPassword,
      },
      $unset: {
        verificationResetPassword: '',
      },
    });

    return user;
  },

  async setPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(accountNotExistsText);
    }

    const correctPassword = getPurePasswordOrThrowError(password);
    const hashedPassword = await getHashedPasswordFromPlainText(correctPassword);

    await collection.updateOne({
      _id: user._id,
    }, {
      $set: {
        password: hashedPassword,
      },
    });

    return true;
  },
};

module.exports = users;
