// @flow
const tools = require('../tools');
const collection = require('./collections/categories');

const defProductsCount = 0;
const defLimit = 100;
const maxLimit = 300;

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

const categories = {
  async add(name?: string): Promise<Object> {
    const count = await collection.estimatedDocumentCount();
    const pos = count + 1;
    let pureName = name;

    if (typeof pureName !== 'string') {
      const prefix = 'Category';
      pureName = `${prefix} ${pos}`;
    } else {
      pureName = pureName.trim();
    }

    const insertData: { [string]: any } = {
      pos,
      name: pureName,
      productsCount: defProductsCount,
    };

    const insertRes = await collection.insertOne(insertData);
    insertData._id = insertRes.insertedId;
    return insertData;
  },

  async addProduct(id: string): Promise<Object> {
    const { value } = await incPromise(id, 1);
    return value;
  },

  async get(skip?: number, query: any): Promise<Object> {
    const rQuery = typeof query === 'object' && query !== null ? query : {};
    let pureLimit = parseInt(rQuery.limit);

    if (Number.isNaN(pureLimit)) {
      pureLimit = defLimit;
    } else if (pureLimit > maxLimit) {
      pureLimit = maxLimit;
    }

    const pureSkip = parseInt(skip) || 0;
    const pureQuery = {};

    if (typeof rQuery.namePattern === 'string') {
      pureQuery.name = {
        $regex: new RegExp(rQuery.namePattern, 'i'),
      };
    }

    const promise = new Promise((resolve, reject) => {
      collection.find(pureQuery, {
        limit: pureLimit + 1,
        skip: pureSkip,
      }).sort('pos', -1).toArray((error, items) => {
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

    return promise;
  },

  async remove(id: MongoID): Promise<Object> {
    const { value } = await collection.findOneAndDelete({
      _id: tools.getMongoID(id),
    });

    if (value) {
      return value;
    }

    throw new Error(`Category with id "${id.toString()}" not found`);
  },

  async removeProduct(id: string): Promise<Object> {
    const { value } = await incPromise(id, -1);
    return value;
  },

  async update(id: MongoID, updateData: Object): Promise<Object> {
    let newData = {};

    if (typeof updateData === 'object' && updateData !== null) {
      newData = updateData;
    }

    const setObject = {};
    const pureName = typeof newData.name === 'string' ? newData.name.trim() : '';

    if (pureName.length > 0) {
      setObject.name = pureName;
    }

    const pureProductsCount = parseInt(newData.productsCount);

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

    return value;
  },
};

module.exports = categories;
