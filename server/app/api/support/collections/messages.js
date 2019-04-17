// @flow
const collection = MongoStore.collection('support-messages');

[
  'createdAt',
  'email',
  'name',
  'answer',
  'subjId',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

module.exports = collection;
