// @flow
const collection = MongoStore.collection('copmpetition-members');

collection.createIndex({
  value: 1,
});

module.exports = collection;
