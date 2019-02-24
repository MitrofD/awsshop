// @flow
const collection = MongoStore.collection('monthPayments');

collection.createIndex({
  updatedAt: 1,
});

collection.createIndex({
  monthYear: 1,
  userId: 1,
});

module.exports = collection;
