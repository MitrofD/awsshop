// @flow
const collection = MongoStore.collection('support-subjects');

collection.createIndex({
  subject: 1,
});

module.exports = collection;
