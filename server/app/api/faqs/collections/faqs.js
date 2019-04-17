// @flow
const collection = MongoStore.collection('faqs');

collection.createIndex({
  question: 1,
});

module.exports = collection;
