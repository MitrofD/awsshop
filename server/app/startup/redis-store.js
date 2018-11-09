// @flow
const redis = require('../api/redis');

const {
  REDIS_IP,
  REDIS_PORT,
  REDIS_PASS,
} = process.env;

const redisStore = redis.createClient(REDIS_PORT, REDIS_IP);

if (REDIS_PASS) {
  redisStore.auth(REDIS_PASS);
}

module.exports = redisStore;
