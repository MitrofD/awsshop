// @flow
const collection = MongoStore.collection('vacancies');

[
  'title',
  'location',
].forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

module.exports = collection;
