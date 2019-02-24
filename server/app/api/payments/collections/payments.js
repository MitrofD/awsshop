// @flow
const collection = MongoStore.collection('payments');

const indexes = [
  'createdAt',
  'userId',
];

indexes.forEach((index) => {
  collection.createIndex({
    [index]: 1,
  });
});

module.exports = collection;
