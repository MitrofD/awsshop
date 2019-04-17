// @flow
const messageCollection = require('./collections/messages');
const subjectCollection = require('./collections/subjects');
const tools = require('../tools');

const DEF_LIMIT = 100;
const MAX_LIMIT = 300;
const NOT_FOUND_MESSAGE_TEXT = 'Message not found';
const NOT_FOUND_SUBJECT_TEXT = 'Subject not found';

const getCleanStr = (mbStr: any): string => {
  const rStr = typeof mbStr === 'string' ? mbStr.trim() : '';
  return rStr;
};

const strIsRequired = (value: any, field: string): string => {
  const pureVal = getCleanStr(value);

  if (pureVal.length === 0) {
    throw new Error(`${field} is required`);
  }

  return pureVal;
};

const getSubjectErrorsOrData = (mbData: any): Object => {
  const pData = typeof mbData === 'object' && mbData !== null ? mbData : {};
  const errors = {};
  const data = {};

  const checkObj = {
    subject: 'Subject',
  };

  const keys = Object.keys(checkObj);
  const keysLength = keys.length;
  let i = 0;

  for (; i < keysLength; i += 1) {
    const key = keys[i];
    const value = checkObj[key];

    try {
      data[key] = strIsRequired(pData[key], value);
    } catch (error) {
      errors[key] = error.message;
    }
  }

  const errorsCount = Object.keys(errors);

  if (errorsCount.length > 0) {
    return {
      errors,
    };
  }

  return {
    data,
  };
};

const support = {
  async addMessage(data: any): Promise<string> {
    const pureData = typeof data === 'object' && data !== null ? data : {};
    const pureEmail = strIsRequired(pureData.email, 'Email');

    if (!Tools.emailRegExp.test(pureEmail)) {
      throw new Error('Email is incorrect');
    }

    const pureName = strIsRequired(pureData.name, 'Name');
    const pureMessage = strIsRequired(pureData.message, 'Message');

    const insertData: { [string]: any } = {
      createdAt: new Date(),
      email: pureEmail,
      name: pureName,
      message: pureMessage,
      answer: null,
      subject: null,
      subjId: null,
    };

    const purePhone = getCleanStr(pureData.phone);

    if (purePhone.length > 0) {
      insertData.phone = purePhone;
    }

    const pureSubjId = getCleanStr(pureData.subjId);

    if (pureSubjId.length > 0) {
      const subjMongoId = tools.getMongoID(pureSubjId);
      const subjectItem = await subjectCollection.findOne({
        _id: subjMongoId,
      });

      if (subjectItem) {
        insertData.subjId = pureSubjId;
        insertData.subject = subjectItem.subject;
      } else {
        throw new Error('Message subject is incorrect');
      }
    }

    const insertRes = await messageCollection.insertOne(insertData);
    return insertRes.insertedId;
  },

  async addSubject(mdData: any): ErrorsPromise<Object> {
    const errorsOrData = getSubjectErrorsOrData(mdData);

    if (typeof errorsOrData.data === 'object' && errorsOrData.data !== null) {
      const data: Object = errorsOrData.data;
      const insertRes = await subjectCollection.insertOne(data);
      data._id = insertRes.insertedId;
    }

    return errorsOrData;
  },

  async getMessages(query: any): Promise<Object> {
    const rQuery = typeof query === 'object' && query !== null ? query : {};
    const pureQuery = {};
    const pureSkip = parseInt(rQuery.skip) || 0;
    let pureLimit = parseInt(rQuery.limit);

    if (Number.isNaN(pureLimit)) {
      pureLimit = DEF_LIMIT;
    } else if (pureLimit > MAX_LIMIT) {
      pureLimit = MAX_LIMIT;
    }

    if (typeof rQuery.searchPattern === 'string') {
      const searchRegExpArr = [];
      const needRegExp = new RegExp(rQuery.searchPattern, 'i');

      [
        'name',
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

    if (tools.has.call(rQuery, 'read')) {
      const isRead = !!rQuery.read;

      if (isRead) {
        pureQuery.answer = {
          $ne: null,
        };
      } else {
        pureQuery.answer = null;
      }
    }

    if (tools.has.call(rQuery, 'subjId')) {
      pureQuery.subjId = rQuery.subjId;
    }

    const findPromise = new Promise((resolve, reject) => {
      messageCollection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort({ $natural: -1 }).toArray((error, items) => {
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

  async getSubjects(query: any): Promise<Object> {
    const rQuery = typeof query === 'object' && query !== null ? query : {};
    const pureQuery = {};
    const pureSkip = parseInt(rQuery.skip) || 0;
    let pureLimit = parseInt(rQuery.limit);

    if (Number.isNaN(pureLimit)) {
      pureLimit = DEF_LIMIT;
    } else if (pureLimit > MAX_LIMIT) {
      pureLimit = MAX_LIMIT;
    }

    if (typeof rQuery.searchPattern === 'string') {
      pureQuery.subject = {
        $regex: new RegExp(rQuery.searchPattern, 'i'),
      };
    }

    const findPromise = new Promise((resolve, reject) => {
      subjectCollection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort({ $natural: -1 }).toArray((error, items) => {
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

  async answerToMessage(id: MongoID, answer: any): Promise<Object> {
    const pureAnswer = getCleanStr(answer);

    if (pureAnswer.length === 0) {
      throw new Error('Answer is required');
    }

    const mongoId = tools.getMongoID(id);

    const { value } = await messageCollection.findOneAndUpdate({
      _id: mongoId,
    }, {
      $set: {
        answer: pureAnswer,
      },
    }, {
      returnOriginal: false,
    });

    if (typeof value !== 'object' || value === null) {
      throw new Error(NOT_FOUND_MESSAGE_TEXT);
    }

    return value;
  },

  async updateSubject(itemId: MongoID, mdData: any): ErrorsPromise<Object> {
    const mongoId = tools.getMongoID(itemId);
    const existsItem = await subjectCollection.findOne({
      _id: mongoId,
    });

    if (typeof existsItem === 'object' && existsItem !== null) {
      const pureObj = typeof mdData === 'object' && mdData !== null ? mdData : {};
      Object.assign(existsItem, pureObj);
      const errorsOrData = getSubjectErrorsOrData(existsItem);
      delete existsItem._id;

      if (typeof errorsOrData.data === 'object' && errorsOrData.data !== null) {
        await subjectCollection.updateOne({
          _id: mongoId,
        }, {
          $set: existsItem,
        });

        existsItem._id = mongoId;
        errorsOrData.data = existsItem;
      }

      return errorsOrData;
    }

    throw new Error(NOT_FOUND_SUBJECT_TEXT);
  },

  async deleteSubject(itemId: MongoID): Promise<Object> {
    const mongoId = tools.getMongoID(itemId);

    const { value } = await subjectCollection.findOneAndDelete({
      _id: mongoId,
    });

    if (value) {
      return value;
    }

    throw new Error(NOT_FOUND_SUBJECT_TEXT);
  },
};

module.exports = support;
