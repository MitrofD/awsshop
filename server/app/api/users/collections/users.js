// @flow
const usersCollection = MongoStore.collection('users');

[
  'createdAt',
  'fromUser',
  'firstName',
  'lastName',
  'lPayoutTime',
  'lQSold',
  'lRefQSold',
  'verification',
].forEach((key) => {
  usersCollection.createIndex({
    [key]: 1,
  });
});

[
  'email',
  'referralCode',
].forEach((key) => {
  usersCollection.createIndex({
    [key]: 1,
  }, {
    unique: 1,
  });
});

module.exports = usersCollection;
