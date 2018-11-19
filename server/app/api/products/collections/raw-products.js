// @flow
const collection = MongoStore.collection('rawProducts');

[
  'createdAt',
  'title',
  'type',
  'url',
  'userId',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

module.exports = collection;
