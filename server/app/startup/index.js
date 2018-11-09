// @flow
RedisStore = require('./redis-store');
GSession = require('./session');

const mailerGenerationPromise = require('../api/mailer')(`${RootPath}/emails`);

mailerGenerationPromise.then((mailer) => {
  Mailer = mailer;
  // eslint-disable-next-line no-console
  console.log(`📪 - Mailer ready & verified (${mailer.emailAddress})`);
}).catch(Tools.emptyRejectExeption);

const mongoConnectPromise = require('./mongo-store').then(() => {
  const mongoStoreAddress = MongoStore.serverConfig.host + ':' + MongoStore.serverConfig.port;
  // eslint-disable-next-line no-console
  console.log(`🌿 - Connected to "Mongod DB" (${mongoStoreAddress})`);
}).catch(Tools.emptyRejectExeption);

const redisConnectPromise: Promise<boolean> = new Promise((resolve, reject) => {
  RedisStore.on('error', reject);

  const connectHandler = RedisStore.connectSubscribe(() => {
    RedisStore.removeListener('error', reject);
    connectHandler.stop();
    // eslint-disable-next-line no-console
    console.log(`🏎️  - Connected to "Redis store" (${RedisStore.address})`);
    resolve(true);
  });
});

const configTraslationsPromise = require('../api/translations')();
configTraslationsPromise.then((translations) => {
  Translations = translations;
  const availLangs = Object.keys(Translations.list());
  // eslint-disable-next-line no-console
  console.log(`🌍 - Translations set up (${availLangs.join(', ')})`);
}).catch(Tools.emptyRejectExeption);

const promiseAll = Promise.all([
  configTraslationsPromise,
  mailerGenerationPromise,
  mongoConnectPromise,
  redisConnectPromise,
]);

promiseAll.then(() => {
  // eslint-disable-next-line global-require
  require('./middleware');
}).catch(Tools.emptyRejectExeption);

module.exports = promiseAll;
