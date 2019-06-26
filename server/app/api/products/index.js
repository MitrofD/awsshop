// @flow
const collection = require('./collections/products');
const rawCollection = require('./collections/raw-products');
const categories = require('../categories');
const tools = require('../tools');
const usersCollection = MongoStore.collection('users');

const SHOP_TYPE = {
  ALIEXPRESS: 'ALIEXPRESS',
  AMAZON: 'AMAZON',
  EBAY: 'EBAY',
};

const EMPTY_STR = '';
const DEF_LIMIT = 100;
const MAX_LIMIT = 300;
const NOT_FOUND_TEXT = 'Product not found';

type GetData = {
  query: Object,
  sort: Object,
};

const getEarningsForPrice = (price: number) => {
  const pPurchasePrice = Settings.getFloatOption('PURCHASE_PRICE');
  const pPurchasePricePerc = Settings.getFloatOption('PURCHASE_PRICE_PERC');
  let earnings = (price / 100) * pPurchasePricePerc;

  if (earnings > pPurchasePrice) {
    earnings = pPurchasePrice;
  }

  return earnings;
};

const getProfitPrice = (price: number) => {
  const pProfPrice = Settings.getFloatOption('PROFIT_PRICE');
  const pProfPricePerc = Settings.getFloatOption('PROFIT_PRICE_PERC');
  let profit = (price / 100) * pProfPricePerc;

  if (profit > pProfPrice) {
    profit = pProfPrice;
  }

  return price + profit;
};

const pureProductOrThrowError = (data: Object, asRaw: boolean = false): Object => {
  const pureUrl = typeof data.url === 'string' ? data.url.trim() : EMPTY_STR;

  if (pureUrl.length === 0) {
    throw new Error('URL is required');
  }

  const pureTitle = typeof data.title === 'string' ? data.title.trim() : EMPTY_STR;

  if (pureTitle.length === 0) {
    throw new Error('Title is required');
  }

  const pureType = typeof data.type === 'string' ? data.type : EMPTY_STR;

  if (!tools.has.call(SHOP_TYPE, pureType)) {
    throw new Error('Type is not available');
  }

  const purePrice = parseFloat(data.price) || 0;
  const pureMinPrice = parseFloat(data.minPrice) || 0;
  const pureMaxPrice = parseFloat(data.maxPrice) || 0;

  if (purePrice === 0) {
    throw new Error('Price is required');
  }

  const pureOrigPrice = parseFloat(data.origPrice) || 0;
  const timeNow = new Date();

  const insertData: { [string]: any } = {
    createdAt: timeNow,
    images: [],
    tags: [],
    title: pureTitle,
    type: pureType,
    price: purePrice,
    origPrice: pureOrigPrice,
    sellerLink: null,
    url: pureUrl,
    configurable: data.configurable,
    skuProducts: data.skuProducts,
    isConfigurable: data.isConfigurable,
    minPrice: pureMinPrice,
    maxPrice: pureMaxPrice,
  };

  const pureSellerLink = typeof data.sellerLink === 'string' ? data.sellerLink.trim() : EMPTY_STR;

  if (pureSellerLink.length === 0) {
    insertData.sellerLink = pureSellerLink;
  }

  const arrayAttrs = [
    'images',
    'tags',
  ];

  arrayAttrs.forEach((attr) => {
    const mayBeArrayValue = data[attr];

    if (Array.isArray(mayBeArrayValue)) {
      insertData[attr] = mayBeArrayValue;
    }
  });

  const addIfExists = [
    'description',
    'shipping',
  ];

  addIfExists.forEach((attr) => {
    const attrValue = typeof data[attr] === 'string' ? data[attr].trim() : EMPTY_STR;
    const pureAttrVal = attrValue.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, EMPTY_STR);

    if (pureAttrVal.length !== 0) {
      insertData[attr] = pureAttrVal;
    }
  });

  const imageAttrName = asRaw ? 'mainImage' : 'image';
  const pureMainImage = typeof data[imageAttrName] === 'string' ? data[imageAttrName].trim() : EMPTY_STR;

  if (pureMainImage.length === 0) {
    throw new Error('Image url is required');
  }

  insertData.image = pureMainImage;

  if (!Array.isArray(insertData.images) || insertData.images.length === 0) {
    insertData.images = [
      pureMainImage,
    ];
  }

  if (!asRaw) {
    if (insertData.origPrice === 0) {
      throw new Error('Price is required');
    }

    insertData.earnings = getEarningsForPrice(insertData.origPrice);
    insertData.price = getProfitPrice(insertData.origPrice);
    insertData.minPrice = getProfitPrice(insertData.minPrice);
    insertData.maxPrice = getProfitPrice(insertData.maxPrice);

    insertData.skuProducts = insertData.skuProducts.map(function (findItem) {
      const { ...newItem } = findItem;
      const { value } = newItem.skuVal.skuAmount;

      newItem.skuVal.skuAmount.value = getProfitPrice(value);

      return newItem;
    });

    if (insertData.earnings === 0) {
      throw new Error('Earnings is required');
    }

    const pureCategoryId = typeof data.categoryId === 'string' ? data.categoryId.trim() : EMPTY_STR;

    if (pureCategoryId.length === 0) {
      throw new Error('Category id is required');
    }

    insertData.categoryId = pureCategoryId;

    addIfExists.forEach((checkAttr) => {
      if (!tools.has.call(insertData, checkAttr)) {
        throw new Error(`${tools.capitalize(checkAttr)} is required`);
      }
    });
  }

  return insertData;
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

  if (tools.has.call(query, 'isPaused')) {
    pureQuery.isPaused = !!query.isPaused;
  }

  if (tools.has.call(query, 'isApproved')) {
    pureQuery.isApproved = !!query.isApproved;
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

const deleteWithCollection = async (deleteCollection: Object, userId: string, id: MongoID): Promise<Object> => {
  const mongoId = tools.getMongoID(id);

  const user = await usersCollection.findOne({
    _id: tools.getMongoID(userId),
  });

  if (!user) {
    throw new Error(NOT_FOUND_TEXT);
  }

  const query: { [string]: any } = {
    _id: mongoId,
  };

  if (!user.isAdmin) {
    query.userId = userId;
  }

  const { value } = await deleteCollection.findOneAndDelete(query);

  if (typeof value === 'object' && value != null) {
    await categories.removeProduct(value.categoryId);
    return value;
  }

  throw new Error(NOT_FOUND_TEXT);
};

const products = {
  SHOP_TYPE,

  async add(userId: string, data: any): Promise<Object> {
    const rData = typeof data === 'object' && data !== null ? data : {};
    const pureProduct = pureProductOrThrowError(rData, true);
    pureProduct.userId = userId;
    const insertRes = await rawCollection.insertOne(pureProduct);
    pureProduct._id = insertRes.insertedId;

    return pureProduct;
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

  rawRemove: (userId: string, id: MongoID) => deleteWithCollection(rawCollection, userId, id),

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

  async remove(userId: string, id: MongoID): Promise<Object> {
    const deletedItm = await deleteWithCollection(collection, userId, id);
    return deletedItm;
  },

  async push(userId: string, rawId: string, data: any): Promise<Object> {
    const pUserId = tools.getMongoID(userId);

    const user = await usersCollection.findOne({
      _id: pUserId,
    });

    if (!user) {
      throw new Error(NOT_FOUND_TEXT);
    }

    const rawProduct = await this.rawWithId(rawId);

    if (rawProduct.userId !== userId) {
      throw new Error(NOT_FOUND_TEXT);
    }

    const rawProductId = rawProduct._id;
    delete rawProduct._id;

    if (typeof data === 'object' && data !== null) {
      Object.assign(rawProduct, data);
    }

    rawProduct.origPrice = rawProduct.price;
    const pureProduct = pureProductOrThrowError(rawProduct);
    pureProduct.userId = userId;
    pureProduct.isApproved = false;
    const promises: Object[] = [];

    if (user.isAdmin) {
      pureProduct.isApproved = true;
      const incPromise = categories.addProduct(pureProduct.categoryId);
      promises.push(incPromise);
    }

    pureProduct.advData = {
      userEmail: user.email,
      userFullName: `${user.firstName} ${user.lastName}`,
    };

    pureProduct.isPaused = false;

    const insertRes = await collection.insertOne(pureProduct);
    pureProduct._id = insertRes.insertedId;

    promises.push(rawCollection.deleteOne({
      _id: rawProductId,
    }));

    await Promise.all(promises);
    pureProduct.rawId = rawProductId;
    return pureProduct;
  },

  async update(userId: string, id: MongoID, updateData: any, asAdmin: boolean = false): Promise<Object> {
    const product = await this.withId(id);
    const pData = tools.anyAsObj(updateData);

    const setObj = {};
    const checkAsBoolProps = ['isPaused'];
    let needUpdate = false;

    if (asAdmin) {
      checkAsBoolProps.push('isApproved');
    } else if (product.userId !== userId) {
      throw new Error(NOT_FOUND_TEXT);
    }

    const checkAsBoolPropsLength = checkAsBoolProps.length;
    let pI = 0;

    for (; pI < checkAsBoolPropsLength; pI += 1) {
      const prop = checkAsBoolProps[pI];

      if (tools.has.call(pData, prop)) {
        needUpdate = true;
        setObj[prop] = !!pData[prop];
      }
    }

    if (!needUpdate) {
      return product;
    }

    if (tools.has.call(setObj, 'isApproved') && product.isApproved !== setObj.isApproved) {
      if (setObj.isApproved) {
        await categories.addProduct(product.categoryId);
      } else {
        await categories.removeProduct(product.categoryId);
      }
    }

    const { value } = await collection.findOneAndUpdate({
      _id: product._id,
    }, {
      $set: setObj,
    }, {
      returnOriginal: false,
    });

    return value;
  },

  /*
  async update(userId: string, id: MongoID, updateData: Object): Promise<Object> {
    const product = await this.withId(id);

    if (product.userId !== userId) {
      throw new Error(NOT_FOUND_TEXT);
    }

    const oldPrice = product.price;
    const oldId = product._id;
    const oldCategoryId = product.categoryId;

    if (typeof updateData === 'object' && updateData !== null) {
      Object.assign(product, updateData);
    }

    const pureProduct = pureProductOrThrowError(product);
    pureProduct.userId = userId;
    delete pureProduct.createdAt;

    if (oldPrice !== pureProduct.price) {
      try {
        await cartProducts.setNewPrice(oldId.toString(), pureProduct.price);
        // eslint-disable-next-line no-empty
      } catch (error) {}
    }

    if (oldCategoryId !== pureProduct.categoryId) {
      await Promise.all([
        categories.removeProduct(oldCategoryId),
        categories.addProduct(pureProduct.categoryId),
      ]);
    }

    pureProduct.isPaused = !!product.isPaused;

    await collection.updateOne({
      _id: oldId,
    }, {
      $set: pureProduct,
    });

    pureProduct._id = oldId;
    return pureProduct;
  },
  */

  async withId(id: MongoID, advQuery: any): Promise<Object> {
    const pureQuery = typeof advQuery === 'object' && advQuery !== null ? advQuery : {};
    pureQuery._id = tools.getMongoID(id);

    const product = await collection.findOne(pureQuery);

    if (!product) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return product;
  },

  async withUrl(url: string, advQuery: any): Promise<Object> {
    const pureQuery = typeof advQuery === 'object' && advQuery !== null ? advQuery : {};
    pureQuery.url = url;

    const product = await collection.findOne(pureQuery);

    if (!product) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return product;
  },
};

module.exports = products;
