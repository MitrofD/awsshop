// @flow
const collection = MongoStore.collection('groupOrders');

[
  'updatedAt',
  'userId',
  'productId',
  'title',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

module.exports = collection;
