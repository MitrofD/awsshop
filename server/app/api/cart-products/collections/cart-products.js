// @flow
const collection = MongoStore.collection('cartProducts');

const uniqueKey = {
  userId: 1,
  productId: 1,
};

Object.keys(uniqueKey).forEach((key) => {
  collection.createIndex({
    [key]: 1,
  });
});

collection.createIndex({
  ownerId: 1,
});

collection.createIndex({
  orderId: 1,
});

collection.createIndex(uniqueKey, {
  unique: 1,
});

module.exports = collection;
