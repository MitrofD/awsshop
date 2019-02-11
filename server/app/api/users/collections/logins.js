// @flow
const userLoginsCollection = MongoStore.collection('userLogins');

userLoginsCollection.createIndex({
  userEmail: 1,
});

module.exports = userLoginsCollection;
