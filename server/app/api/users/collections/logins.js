// @flow
const userLoginsCollection = MongoStore.collection('userLogins');

[
  'createdAt',
  'description',
  'userEmail',
].forEach((key) => {
  userLoginsCollection.createIndex({
    [key]: 1,
  });
});

module.exports = userLoginsCollection;
