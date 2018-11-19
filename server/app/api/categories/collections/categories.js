// @flow
const collection = MongoStore.collection('categories');

[
  'createdAt',
  'productsCount',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

collection.createIndex({
  name: 1,
}, {
  unique: 1,
});

module.exports = collection;
