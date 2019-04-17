// @flow
const collection = require('./collections/pages');
const tools = require('../tools');

const DEF_LIMIT = 100;
const MAX_LIMIT = 300;
const NOT_FOUND_TEXT = 'Requested page not found';

const strIsRequired = (str: any, fld: string): string => {
  const pStr = typeof str === 'string' ? str.trim() : '';

  if (pStr.length === 0) {
    throw new Error(`${fld} is required`);
  }

  return pStr;
};

const errorsPromise = async (mbData: any, checkUnique: boolean = true): ErrorsPromise<Object> => {
  const pData = typeof mbData === 'object' && mbData !== null ? mbData : {};
  const errors = {};
  const data = {};

  const checkObj = {
    title: 'Title',
    path: 'Path',
    content: 'Content',
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

  if (checkUnique && typeof data.path === 'string') {
    const existsPage = await collection.findOne({
      path: data.path,
    });

    if (existsPage) {
      errors.path = `Path "${data.path}" already exists`;
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

const pages = {
  async add(mdData: any): ErrorsPromise<Object> {
    const errorsOrData = await errorsPromise(mdData);

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
        'path',
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
    const existsPage = await this.getByID(pageId);

    if (typeof existsPage === 'object' && existsPage !== null) {
      const oldId = existsPage._id;
      const pureObj = typeof mdData === 'object' && mdData !== null ? mdData : {};
      Object.assign(existsPage, pureObj);
      const errorsOrData = await errorsPromise(existsPage, false);
      delete existsPage._id;

      if (typeof errorsOrData.data === 'object' && errorsOrData.data !== null) {
        await collection.updateOne({
          _id: oldId,
        }, {
          $set: existsPage,
        });

        existsPage._id = oldId;
        errorsOrData.data = existsPage;
      }

      return errorsOrData;
    }

    throw new Error(NOT_FOUND_TEXT);
  },

  async withId(id: MongoID, advQuery: any): Promise<Object> {
    const pureQuery = typeof advQuery === 'object' && advQuery !== null ? advQuery : {};
    pureQuery._id = tools.getMongoID(id);

    const page = await collection.findOne(pureQuery);

    if (!page) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return page;
  },

  async withPath(path: string, advQuery: any): Promise<Object> {
    const pureQuery = typeof advQuery === 'object' && advQuery !== null ? advQuery : {};
    pureQuery.path = path;

    const page = await collection.findOne(pureQuery);

    if (!page) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return page;
  },
};

module.exports = pages;
