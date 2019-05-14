// @flow
const collection = require('./collections/vacancies');
const tools = require('../tools');

const DEF_LIMIT = 100;
const MAX_LIMIT = 300;
const DEF_QUANTITY = 1;
const NOT_FOUND_TEXT = 'Requested vacancy not found';

const getCleanStr = (mbStr: any) => typeof mbStr === 'string' ? mbStr.trim() : '';

const strIsRequired = (mbStr: any, fld: string) => {
  const pStr = getCleanStr(mbStr);

  if (pStr.length === 0) {
    throw new Error(`${fld} is required`);
  }

  return pStr;
};

const errorsPromise = (mbData: any): ObjectWithErrors<Object> => {
  const pData = typeof mbData === 'object' && mbData !== null ? mbData : {};
  const errors = {};
  const data = {};

  const reqObj = {
    description: 'Description',
    location: 'Location',
    title: 'Title',
  };

  const keys = Object.keys(reqObj);
  const keysLength = keys.length;
  let i = 0;

  for (; i < keysLength; i += 1) {
    const key = keys[i];
    const value = reqObj[key];

    try {
      data[key] = strIsRequired(pData[key], value);
    } catch (error) {
      errors[key] = error.message;
    }
  }

  const purePosition = getCleanStr(pData.position);
  data.position = purePosition.length > 0 ? purePosition : null;
  data.quantity = parseInt(pData.quantity) || DEF_QUANTITY;

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

const exportsData = {
  async add(mdData: any): ErrorsPromise<Object> {
    const errorsOrData = errorsPromise(mdData);

    if (typeof errorsOrData.data === 'object' && errorsOrData.data !== null) {
      const data: Object = errorsOrData.data;
      const insertRes = await collection.insertOne(data);
      data._id = insertRes.insertedId;
    }

    return errorsOrData;
  },

  async getByID(pageId: MongoID): Promise<Object> {
    const mongoId = tools.getMongoID(pageId);
    return collection.findOne({
      _id: mongoId,
    });
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
      const searchRegExpArr = [];
      const needRegExp = new RegExp(rQuery.searchPattern, 'i');

      [
        'title',
        'location',
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

    const findPromise = new Promise((resolve, reject) => {
      collection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort('natural', -1).toArray((error, items) => {
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

  async remove(pageId: MongoID): Promise<Object> {
    const mongoId = tools.getMongoID(pageId);

    const { value } = await collection.findOneAndDelete({
      _id: mongoId,
    });

    if (value) {
      return value;
    }

    throw new Error(NOT_FOUND_TEXT);
  },

  async update(pageId: MongoID, mdData: any): ErrorsPromise<Object> {
    const exists = await this.getByID(pageId);

    if (typeof exists === 'object' && exists !== null) {
      const oldId = exists._id;
      const pureObj = typeof mdData === 'object' && mdData !== null ? mdData : {};
      Object.assign(exists, pureObj);

      const errorsOrData = errorsPromise(exists);
      delete exists._id;

      if (typeof errorsOrData.data === 'object' && errorsOrData.data !== null) {
        await collection.updateOne({
          _id: oldId,
        }, {
          $set: exists,
        });

        exists._id = oldId;
        errorsOrData.data = exists;
      }

      return errorsOrData;
    }

    throw new Error(NOT_FOUND_TEXT);
  },

  async withId(id: MongoID): Promise<Object> {
    const mongoId = tools.getMongoID(id);
    const value = await collection.findOne({
      _id: mongoId,
    });

    if (!value) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return value;
  },
};

module.exports = exportsData;
