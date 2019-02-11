// @flow
const usersCollection = MongoStore.collection('users');

[
  'createdAt',
  'firstName',
  'verification',
  'lastName',
].forEach((key) => {
  usersCollection.createIndex({
    [key]: 1,
  });
});

[
  'email',
  'refCode',
].forEach((key) => {
  usersCollection.createIndex({
    [key]: 1,
  }, {
    unique: 1,
  });
});

module.exports = usersCollection;
