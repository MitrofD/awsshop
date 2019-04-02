// @flow
const collection = MongoStore.collection('monthRefPayments');

collection.createIndex({
  updatedAt: 1,
});

collection.createIndex({
  userName: 1,
});

collection.createIndex({
  monthYear: 1,
  userId: 1,
}, {
  unique: 1,
});

module.exports = collection;
