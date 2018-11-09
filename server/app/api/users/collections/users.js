// @flow
const usersCollection = MongoStore.collection('users');

usersCollection.createIndex({
  email: 1,
}, {
  unique: 1,
});

usersCollection.createIndex({
  verification: 1,
});

module.exports = usersCollection;
