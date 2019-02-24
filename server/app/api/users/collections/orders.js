// @flow
const collection = MongoStore.collection('orders');

[
  'createdAt',
  'userId',
  'title',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

module.exports = collection;
