// @flow
const tools = require('../tools');
const collection = require('./collections/products');
const rawCollection = require('./collections/raw-products');

const SHOP_TYPE = {
  ALIEXPRESS: 'ALIEXPRESS',
  AMAZON: 'AMAZON',
  EBAY: 'EBAY',
};

const DEF_LIMIT = 100;
const MAX_LIMIT = 300;
const NOT_FOUND_TEXT = 'Product not found';

type GetData = {
  query: Object,
  sort: Object,
};

const getDataFromQuery = (query: Object): GetData => {
  const pureQuery = {};

  if (typeof query.userId === 'string') {
    pureQuery.userId = query.userId;
  }

  if (typeof query.categoryId === 'string') {
    pureQuery.categoryId = query.categoryId;
  }

  if (typeof query.titlePattern === 'string') {
    pureQuery.title = {
      $regex: new RegExp(query.titlePattern, 'i'),
    };
  }

  const pureSort = {};

  if (typeof query.sortBy === 'string') {
    const sortDesc = parseInt(query.sortDesc) || 1;
    pureSort[query.sortBy] = sortDesc;
  }

  return {
    query: pureQuery,
    sort: pureSort,
  };
};

const products = {
  async add(userId: string, rawId: string): Promise<Object> {
    const rawProduct = await this.rawWithId(rawId);

    if (rawProduct.userId !== userId) {
      throw new Error(NOT_FOUND_TEXT);
    }

    delete rawProduct._id;
    const result = await collection.insertOne(rawProduct);
    rawProduct._id = result.insertedId;

    return rawProduct;
  },

  async addRow(userId: string, data: any): Promise<Object> {
    const rData = typeof data === 'object' && data !== null ? data : {};
    const pureUrl = typeof rData.url === 'string' ? rData.url.trim() : '';

    if (pureUrl.length === 0) {
      throw new Error('URL is required');
    }

    const purePrice = parseFloat(rData.price) || 0;

    const pureTitle = typeof rData.title === 'string' ? rData.title.trim() : '';

    if (pureTitle.length === 0) {
      throw new Error('Title is required');
    }

    const pureType = typeof rData.type === 'string' ? rData.type : '';

    if (!tools.has.call(SHOP_TYPE, pureType)) {
      throw new Error('Type is not available');
    }

    const pureMainImage = typeof rData.mainImage === 'string' ? rData.mainImage : null;

    if (!pureMainImage) {
      throw new Error('Image url is required');
    }

    const timeNow = new Date();

    const insertData: { [string]: any } = {
      userId,
      createdAt: timeNow,
      description: null,
      shipping: null,
      image: pureMainImage,
      images: [],
      tags: [],
      title: pureTitle,
      type: pureType,
      price: purePrice,
      sellerLink: null,
      url: pureUrl,
    };

    const pureSellerLink = typeof rData.sellerLink === 'string' ? rData.sellerLink.trim() : null;

    if (pureSellerLink) {
      insertData.sellerLink = pureSellerLink;
    }

    const arrayAttrs = [
      'images',
      'tags',
    ];

    arrayAttrs.forEach((attr) => {
      const mayBeArrayValue = rData[attr];

      if (Array.isArray(mayBeArrayValue)) {
        insertData[attr] = mayBeArrayValue;
      }
    });

    const addIfExists = [
      'description',
      'shipping',
    ];

    addIfExists.forEach((attr) => {
      const attrValue = rData[attr] === 'string' ? rData[attr].trim() : '';
      const pureAttrVal = attrValue.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      if (pureAttrVal.length > 0) {
        insertData[attr] = pureAttrVal;
      }
    });

    const insertRes = await rawCollection.insertOne(insertData);
    insertData._id = insertRes.insertedId;
    return insertData;
  },

  async get(query: any): Promise<Object> {
    const rQuery = typeof query === 'object' && query !== null ? query : {};
    const pureData = getDataFromQuery(rQuery);
    const pureSkip = parseInt(query.skip) || 0;
    let pureLimit = parseInt(query.limit);

    if (Number.isNaN(pureLimit)) {
      pureLimit = DEF_LIMIT;
    } else if (pureLimit > MAX_LIMIT) {
      pureLimit = MAX_LIMIT;
    }

    const findPromise = new Promise((resolve, reject) => {
      collection.find(pureData.query, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort(pureData.sort).toArray((error, items) => {
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

  async getRaw(query: any): Promise<Object> {
    const rQuery = typeof query === 'object' && query !== null ? query : {};
    const pureData = getDataFromQuery(rQuery);
    const pureSkip = parseInt(query.skip) || 0;
    let pureLimit = parseInt(query.limit);

    if (Number.isNaN(pureLimit)) {
      pureLimit = DEF_LIMIT;
    } else if (pureLimit > MAX_LIMIT) {
      pureLimit = MAX_LIMIT;
    }

    const findPromise = new Promise((resolve, reject) => {
      rawCollection.find(pureData.query, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort(pureData.sort).toArray((error, items) => {
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

  async remove(id: MongoID): Promise<Object> {
    const { value } = await collection.findOneAndDelete({
      _id: tools.getMongoID(id),
    });

    if (value) {
      return value;
    }

    throw new Error(NOT_FOUND_TEXT);
  },

  async rawWithId(id: MongoID): Promise<Object> {
    const pureId = tools.getMongoID(id);
    const product = await rawCollection.findOne({
      _id: pureId,
    });

    if (!product) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return product;
  },

  async update(id: MongoID, updateData: Object): Promise<Object> {
    const setObject = {};
    const pureTitle = typeof updateData.title === 'string' ? updateData.title.trim() : '';

    if (pureTitle.length > 0) {
      setObject.title = pureTitle;
    }

    const { value } = await collection.findOneAndUpdate({
      _id: tools.getMongoID(id),
    }, {
      $set: setObject,
    }, {
      returnOriginal: false,
    });

    if (typeof value !== 'object' || value === null) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return value;
  },

  async withId(id: MongoID): Promise<Object> {
    const pureId = tools.getMongoID(id);
    const product = await collection.findOne({
      _id: pureId,
    });

    if (!product) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return product;
  },

  async withUrl(url: string): Promise<Object> {
    const product = await collection.findOne({
      url,
    });

    if (!product) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return product;
  },
};

module.exports = products;
