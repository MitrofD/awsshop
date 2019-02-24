// @flow
const collection = require('./collections/payments');

const payments = {
  async add(userId: string, price: number): Promise<Object> {
    const createdAt = new Date();

    const insertData: { [string]: any } = {
      createdAt,
      userId,
      price,
    };

    const { insertedId } = await collection.insertOne(insertData);
    insertData._id = insertedId;

    return insertData;
  },
};

module.exports = payments;

/*
const collection = require('./collection');
const monthCollection = require('./month-collection');

const payments = {
  async add(userId: string, price: number): Promise<Object> {
    const createdAt = new Date();
    const monthYear = `${createdAt.getMonth()}-${createdAt.getFullYear()}`;

    const insertData: { [string]: any } = {
      createdAt,
      userId,
      price,
    };

    const [insData] = [
      await collection.insertOne(insertData),
      await monthCollection.update({
        createdAt,
        monthYear,
        userId,
      }, {
        $inc: {
          price,
        },
      }, {
        upsert: true,
      }),
    ];

    insertData._id = insData.insertedId;

    return insertData;
  },
};

module.exports = payments;
*/
