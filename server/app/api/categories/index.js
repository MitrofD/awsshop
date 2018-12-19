// @flow
const tools = require('../tools');
const collection = require('./collections/categories');

const MIN_PRODUCTS_COUNT = 0;
const DEF_LIMIT = 100;
const MAX_LIMIT = 300;
const NOT_FOUND_TEXT = 'Category not found';

const incPromise = (id: MongoID, toInc: number): Promise<Object> => {
  const promise = collection.findOneAndUpdate({
    _id: tools.getMongoID(id),
  }, {
    $inc: {
      productsCount: toInc,
    },
  });

  return promise;
};

const nameIsUnique = async (name: string): Promise<void> => {
  const res = await collection.findOne({
    name,
  });

  if (res) {
    throw new Error(`Category with name "${name}" already exists`);
  }
};

const categories = {
  async add(name: any): Promise<Object> {
    const pureName = typeof name === 'string' ? name.trim() : '';

    if (pureName.length === 0) {
      throw new Error('Category name is required');
    }

    await nameIsUnique(pureName);

    const insertData: { [string]: any } = {
      name: pureName,
      productsCount: MIN_PRODUCTS_COUNT,
    };

    const insertRes = await collection.insertOne(insertData);
    insertData._id = insertRes.insertedId;
    return insertData;
  },

  async addProduct(id: string): Promise<Object> {
    const { value } = await incPromise(id, 1);
    return value;
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

    if (typeof rQuery.namePattern === 'string') {
      pureQuery.name = {
        $regex: new RegExp(rQuery.namePattern, 'i'),
      };
    }

    const pureSort = {};

    if (typeof rQuery.sortBy === 'string') {
      const sortDesc = parseInt(rQuery.sortDesc) || 1;
      pureSort[rQuery.sortBy] = sortDesc;
    }

    const findPromise = new Promise((resolve, reject) => {
      collection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort(pureSort).toArray((error, items) => {
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

  async removeProduct(id: string): Promise<Object> {
    const { value } = await incPromise(id, -1);
    return value;
  },

  async update(id: MongoID, updateData: Object): Promise<Object> {
    const setObject = {};
    const pureName = typeof updateData.name === 'string' ? updateData.name.trim() : '';

    if (pureName.length > 0) {
      await nameIsUnique(pureName);
      setObject.name = pureName;
    }

    const pureProductsCount = parseInt(updateData.productsCount);

    if (!Number.isNaN(pureProductsCount)) {
      setObject.productsCount = Math.abs(pureProductsCount);
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
    const category = await collection.findOne({
      _id: tools.getMongoID(id),
    });

    if (!category) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return category;
  },

  async withName(name: string): Promise<Object> {
    const category = await collection.findOne({
      name,
    });

    if (!category) {
      throw new Error(NOT_FOUND_TEXT);
    }

    return category;
  },
};

module.exports = categories;
