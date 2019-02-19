// @flow
const collection = MongoStore.collection('products');

[
  'categoryId',
  'createdAt',
  'isApproved',
  'isPaused',
  'title',
  'price',
  'userId',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

collection.createIndex({
  url: 1,
}, {
  unique: true,
});

module.exports = collection;
