// @flow
const usersCollection = MongoStore.collection('users');

[
  'createdAt',
  'verification',
].forEach((key) => {
  usersCollection.createIndex({
    [key]: 1,
  });
});

usersCollection.createIndex({
  email: 1,
}, {
  unique: 1,
});

module.exports = usersCollection;
