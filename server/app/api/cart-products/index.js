// @flow
const collection = require('./collections/cart-products');
const tools = require('../tools');
const products = require('../products');
const users = require('../users');

const NOT_FOUND_TEXT = 'Cart product not found';

const cartProducts = {
  getForUser(userId: string) {
    const getPromise = new Promise((resolve, reject) => {
      collection.find({
        userId,
      }).sort('_id', -1).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(items);
      });
    });

    return getPromise;
  },

  async add(userId: string, productId: string): Promise<Object> {
    const {
      image,
      title,
      price,
    } = await products.withId(productId);

    const purePrice = parseFloat(price) || 0;

    const { value } = await collection.findOneAndUpdate({
      userId,
      productId,
    }, {
      $set: {
        image,
        title,
        price: purePrice,
      },
      $inc: {
        count: 1,
      },
    }, {
      upsert: true,
      returnOriginal: false,
    });

    const { value: userValue } = await users.collection.findOneAndUpdate({
      _id: tools.getMongoID(userId),
    }, {
      $inc: {
        pCount: 1,
      },
    }, {
      returnOriginal: false,
    });

    value.productsCount = userValue.pCount;
    return value;
  },

  async remove(userId: string, id: MongoID): Promise<Object> {
    const { value } = await collection.findOneAndDelete({
      userId,
      _id: tools.getMongoID(id),
    });

    if (!value) {
      throw new Error(NOT_FOUND_TEXT);
    }

    const count = parseInt(value.count) || 0;

    const { value: userValue } = await users.collection.findOneAndUpdate({
      _id: tools.getMongoID(userId),
    }, {
      $inc: {
        pCount: -count,
      },
    }, {
      returnOriginal: false,
    });

    value.productsCount = userValue.pCount;
    return value;
  },

  async setNewPrice(productId: string, price: number): Promise<void> {
    await collection.updateMany({
      productId: productId,
    }, {
      $set: {
        price,
      },
    });
  },

  async setCount(userId: MongoID, id: MongoID, newCount: number): Promise<Object> {
    const pureNewCount = parseInt(newCount) || 0;

    if (pureNewCount === 0) {
      throw new Error('Quantity is required');
    }

    const { value } = await collection.findOneAndUpdate({
      _id: tools.getMongoID(id),
    }, {
      $set: {
        count: pureNewCount,
      },
    });

    const diffCount = pureNewCount - value.count;

    const { value: userValue } = await users.collection.findOneAndUpdate({
      _id: tools.getMongoID(userId),
    }, {
      $inc: {
        pCount: diffCount,
      },
    }, {
      returnOriginal: false,
    });

    value.productsCount = userValue.pCount;
    return value;
  },
};

module.exports = cartProducts;
