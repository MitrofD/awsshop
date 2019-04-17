// @flow
const collection = MongoStore.collection('pages');

[
  'title',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

collection.createIndex({
  path: 1,
}, {
  unique: 1,
});

module.exports = collection;
