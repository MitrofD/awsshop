// @flow
const Session = require('../api/session');
const redisStore = require('./redis-store');

const cookieOptions = {
  expireDays: 30,
  domain: Config.domain,
  secure: Config.isSecure,
};

const sessionStore = redisStore.genSessionStore();
const session = new Session(sessionStore, cookieOptions);

module.exports = session;
