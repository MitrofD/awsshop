// @flow
const collection = MongoStore.collection('categories');

collection.createIndex({
  pos: 1,
});

module.exports = collection;
