// @flow
const collection = MongoStore.collection('carts');

const uniqIndex = {
  sessId: 1,
  productId: 1,
};

const indexes = Object.keys(uniqIndex);
indexes.push('createdAt');

indexes.forEach((index) => {
  collection.createIndex({
    [index]: 1,
  });
});

collection.createIndex(uniqIndex);

module.exports = collection;
