// @flow
const collection = require('./collections/orders');
const tools = require('../tools');

const DEF_LIMIT = 100;
const MAX_LIMIT = 300;
const STATUS = {
  NEW: 'NEW',
  PROCESSED: 'PROCESSED',
  COMPLETED: 'COMPLETED',
};

const orders = {
  collection,
  STATUS,

  async get(query: any): Promise<Object> {
    const rQuery = typeof query === 'object' && query !== null ? query : {};
    const pureQuery = {};
    const pureSkip = parseInt(rQuery.skip) || 0;
    let pureLimit = parseInt(rQuery.limit);

    const availableAttrs = [
      'ownerId',
      'userId',
    ];

    availableAttrs.forEach((attr) => {
      if (tools.has.call(rQuery, attr)) {
        pureQuery[attr] = rQuery[attr];
      }
    });

    if (Number.isNaN(pureLimit)) {
      pureLimit = DEF_LIMIT;
    } else if (pureLimit > MAX_LIMIT) {
      pureLimit = MAX_LIMIT;
    }

    if (typeof rQuery.titlePattern === 'string') {
      pureQuery.title = {
        $regex: new RegExp(rQuery.titlePattern, 'i'),
      };
    }

    if (tools.has.call(rQuery, 'isActive')) {
      let pureIsActive = false;

      if (typeof rQuery.isActive === 'string') {
        pureIsActive = rQuery.isActive === 'true';
      }

      if (pureIsActive) {
        pureQuery.status = {
          $ne: STATUS.COMPLETED,
        };
      } else {
        pureQuery.status = STATUS.COMPLETED;
      }
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

  async update(orderId: MongoID, data: any): Promise<Object> {
    const pureData = typeof data === 'object' && data !== null ? data : {};
    const pureSetObj = {};

    if (typeof pureData.status === 'string') {
      const pureStatus = pureData.status.trim().toUpperCase();

      if (!tools.has.call(STATUS, pureStatus)) {
        throw new Error('Incorrect status');
      }

      pureSetObj.status = pureStatus;
    }

    const { value } = await collection.findOneAndUpdate({
      _id: tools.getMongoID(orderId),
    }, {
      $set: pureSetObj,
    }, {
      returnOriginal: false,
    });

    return value;
  },
};

module.exports = orders;
