// @flow
const collection = require('./collections/carts');
const products = require('../products');
const tools = require('../tools');

const MAX_LIMIT = 100;

const getPureStr = (mbStr: any, field: string): string => {
  const pureStr = typeof mbStr === 'string' ? mbStr.trim() : '';

  if (pureStr.length === 0) {
    throw new Error(`${field} is required`);
  }

  return pureStr;
};

module.exports = {
  async add(sessId: string, productId: string, quantity: any): Promise<Object> {
    const pSessId = getPureStr(sessId, 'sessId');
    const product = await products.withId(productId);
    const incVal = parseInt(quantity) || 1;

    const findCrit = {};
    findCrit.productId = productId;
    findCrit.sessId = pSessId;

    const { value } = await collection.findOneAndUpdate(findCrit, {
      $inc: {
        quantity: incVal,
      },
    }, {
      returnOriginal: false,
    });

    if (value) {
      return value;
    }

    const productsCount = await collection.countDocuments(findCrit, {
      limit: MAX_LIMIT,
    });

    if (productsCount >= MAX_LIMIT) {
      throw new Error(`Maximum products in count (${MAX_LIMIT})`);
    }

    delete product.description;
    delete product.shipping;
    delete product.images;
    delete product.tags;

    findCrit.createdAt = new Date();
    findCrit.title = product.title;
    findCrit.image = product.image;
    findCrit.url = product.url;
    findCrit.price = product.price;
    findCrit.data = product;
    findCrit.quantity = incVal;

    await collection.insertOne(findCrit);
    return findCrit;
  },

  /*
  async getQuantity(sessId: string): Promise<number> {
    const items = await this.get(sessId);
    const itemsLength = results.length;
    let summ = 0;
    let i = 0;

    for (; i < itemsLength; i += 1) {
      const item = items[i];
      summ += item.quantity;
    }
  },
  */

  async setQuantity(id: MongoID, quantity: number) {
    const pId = tools.getMongoID(id);
    const pQuantity = parseInt(quantity) || 0;

    if (quantity === 0) {
      throw new Error('Quantity has to be great than zero');
    }

    const { value } = await collection.findOneAndUpdate({
      _id: pId,
    }, {
      $set: {
        quantity: pQuantity,
      },
    });

    value.oldQuantity = value.quantity;
    value.quantity = pQuantity;

    return value;
  },

  async delete(id: MongoID): Promise<?Object> {
    const pId = tools.getMongoID(id);

    const { value } = await collection.findOneAndDelete({
      _id: pId,
    });

    return value;
  },

  async flush(sessId: string) {
    const pSessId = getPureStr(sessId, 'sessId');

    await collection.deleteMany({
      sessId: pSessId,
    });
  },

  async get(sessId: string): Promise<Object[]> {
    const pSessId = getPureStr(sessId, 'sessId');
    const findPromise = new Promise((resolve, reject) => {
      collection.find({
        sessId: pSessId,
      }, {
        limit: MAX_LIMIT,
      }).toArray((error, items) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(items);
      });
    });

    const items = await findPromise;
    return items;
  },
};
