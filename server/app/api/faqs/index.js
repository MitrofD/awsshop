// @flow
const collection = require('./collections/faqs');
const tools = require('../tools');

const DEF_LIMIT = 100;
const MAX_LIMIT = 300;
const NOT_FOUND_TEXT = 'FAQ item not found';

const strIsRequired = (str: any, fld: string): string => {
  const pStr = typeof str === 'string' ? str.trim() : '';

  if (pStr.length === 0) {
    throw new Error(`${fld} is required`);
  }

  return pStr;
};

const getErrorsOrData = (mbData: any): Object => {
  const pData = typeof mbData === 'object' && mbData !== null ? mbData : {};
  const errors = {};
  const data = {};

  const checkObj = {
    answer: 'Answer',
    question: 'Question',
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

const faqs = {
  async add(mdData: any): ErrorsPromise<Object> {
    const errorsOrData = getErrorsOrData(mdData);

    if (typeof errorsOrData.data === 'object' && errorsOrData.data !== null) {
      const data: Object = errorsOrData.data;
      const insertRes = await collection.insertOne(data);
      data._id = insertRes.insertedId;
    }

    return errorsOrData;
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

    if (typeof rQuery.searchPattern === 'string') {
      pureQuery.question = {
        $regex: new RegExp(rQuery.searchPattern, 'i'),
      };
    }

    const findPromise = new Promise((resolve, reject) => {
      collection.find(pureQuery, {
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

  async update(itemId: MongoID, mdData: any): ErrorsPromise<Object> {
    const mongoId = tools.getMongoID(itemId);
    const existsItem = await collection.findOne({
      _id: mongoId,
    });

    if (typeof existsItem === 'object' && existsItem !== null) {
      const pureObj = typeof mdData === 'object' && mdData !== null ? mdData : {};
      Object.assign(existsItem, pureObj);
      const errorsOrData = getErrorsOrData(existsItem);
      delete existsItem._id;

      if (typeof errorsOrData.data === 'object' && errorsOrData.data !== null) {
        await collection.updateOne({
          _id: mongoId,
        }, {
          $set: existsItem,
        });

        existsItem._id = mongoId;
        errorsOrData.data = existsItem;
      }

      return errorsOrData;
    }

    throw new Error(NOT_FOUND_TEXT);
  },

  async remove(itemId: MongoID): Promise<Object> {
    const mongoId = tools.getMongoID(itemId);

    const { value } = await collection.findOneAndDelete({
      _id: mongoId,
    });

    if (value) {
      return value;
    }

    throw new Error(NOT_FOUND_TEXT);
  },
};

module.exports = faqs;
