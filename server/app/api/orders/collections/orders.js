// @flow
const collection = MongoStore.collection('orders');

[
  'ownerEmail',
  'userEmail',
  'status',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

module.exports = collection;
