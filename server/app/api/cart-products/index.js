// @flow
const crypto = require('crypto');
const collection = require('./collections/cart-products');
const tools = require('../tools');
const orders = require('../orders');
const products = require('../products');
const users = require('../users');

const {
  random,
  alphabet,
} = require('../random');

const CRYPTO_ID_RAND_ALPHABET = alphabet.lowerChars + alphabet.numbers + alphabet.upperChars;
const NOT_FOUND_TEXT = 'Cart product not found';

const cartProducts = {
  async add(userId: string, productId: string): Promise<Object> {
    const {
      image,
      title,
      price,
      userId: ownerId,
    } = await products.withId(productId);

    const owner = await users.getById(ownerId);

    if (!owner) {
      throw new Error('Product owner not found');
    }

    if (ownerId === userId) {
      throw new Error('It\'s your product');
    }

    const purePrice = parseFloat(price) || 0;

    const { value } = await collection.findOneAndUpdate({
      userId,
      productId,
    }, {
      $set: {
        image,
        title,
        ownerId,
        ownerEmail: owner.email,
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

  async apply(userId: string, orderId: string): Promise<Object[]> {
    const user = await users.getById(userId);

    if (!user) {
      throw new Error(users.NOT_EXISTS_ACCOUNT_TEXT);
    }

    const userCartProducts = await collection.find({
      userId,
      orderId,
    }).toArray();

    if (userCartProducts.length === 0) {
      throw new Error('Orders not found');
    }

    const timeNow = new Date();

    userCartProducts.forEach((product) => {
      /* eslint-disable no-param-reassign */
      product.status = orders.STATUS.NEW;
      product.createdAt = timeNow;
      product.userEmail = user.email;
      /* eslint-enable no-param-reassign */
    });

    await orders.collection.insertMany(userCartProducts);

    try {
      await this.cleanForUser(userId);
      // eslint-disable-next-line no-empty
    } catch (error) {}

    return userCartProducts;
  },

  async cleanForUser(userId: string): Promise<void> {
    const deletePromise = collection.deleteMany({
      userId,
    });

    const updatePromise = users.collection.updateOne({
      _id: tools.getMongoID(userId),
    }, {
      $unset: {
        pCount: 0,
      },
    });

    await Promise.all([
      deletePromise,
      updatePromise,
    ]);
  },

  async genOrderId(userId: string): Promise<string> {
    const id = random(CRYPTO_ID_RAND_ALPHABET, 8);
    const cryptoOrderId = crypto.createHash('md5').update(id).digest('hex');

    await collection.updateMany({
      userId,
    }, {
      $set: {
        orderId: cryptoOrderId,
      },
    });

    return cryptoOrderId;
  },

  getForUser(userId: string): Promise<Object[]> {
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
