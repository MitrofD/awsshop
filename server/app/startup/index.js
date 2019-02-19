// @flow
/* eslint-disable no-console,global-require */
RedisStore = require('./redis-store');
GSession = require('./session');
const mailerGenerationPromise = require('../api/mailer')(`${RootPath}/emails`);

const emptyFunc = () => {};

mailerGenerationPromise.then((mailer) => {
  Mailer = mailer;
  console.log(`📪 - Mailer ready & verified (${mailer.emailAddress})`);
}).catch(emptyFunc);

const mongoConnectAndApisPromise = new Promise((resolve, reject) => {
  require('./mongo-store').then((store) => {
    const mongoStoreAddress = store.serverConfig.host + ':' + store.serverConfig.port;
    console.log(`🌿 - Connected to "Mongod DB" (${mongoStoreAddress})`);

    require('../api/settings').then((settings) => {
      Settings = settings;
      console.log('⚙️  - Settings is loaded');
      resolve();
    }).catch(reject);
  }).catch(reject);
});

const redisConnectPromise = new Promise((resolve) => {
  const connectHandler = RedisStore.connectSubscribe(() => {
    console.log(`🏎️  - Connected to "Redis store" (${RedisStore.address})`);
    connectHandler.stop();
    resolve();
  });
});

const configTraslationsPromise = require('../api/translations')();

configTraslationsPromise.then((translations) => {
  Translations = translations;
  const availLangs = Object.keys(Translations.list());
  console.log(`🌍 - Translations set up (${availLangs.join(', ')})`);
}).catch(emptyFunc);

const startupPromise = Promise.all([
  configTraslationsPromise,
  mailerGenerationPromise,
  mongoConnectAndApisPromise,
  redisConnectPromise,
]);

startupPromise.then(() => {
  require('./middleware');
}).catch(emptyFunc);

module.exports = startupPromise;
/* eslint-enable no-console,global-require */
