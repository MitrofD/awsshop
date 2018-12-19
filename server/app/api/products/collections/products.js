// @flow
const collection = MongoStore.collection('products');

[
  'categoryId',
  'createdAt',
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
