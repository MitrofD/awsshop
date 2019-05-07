// @flow
import axios from 'axios';
import carts from '../api/carts';

const applyClientConfig = (data: Object): Object => {
  const advancedData = {
    adminPath: '/admin',
    catalogPath: '/catalog',
    categoryPath: '/category/',
    dashboardPath: '/dashboard',
    inputTimeout: 150,
    settingsPath: '/settings',
  };

  return Object.assign(advancedData, data);
};

const startupPromise: Promise<any[]> = new Promise((resolve, reject) => {
  axios.get(`${proxyPath}/config`).then(({ data }) => {
    const pureConfig = applyClientConfig(data);
    window.Config = Object.freeze(pureConfig);

    /* eslint-disable global-require */
    const cartItemsPromise = carts.get();
    const userConfigPromise = require('./user');
    const translationsConfigPromise = require('./translations');
    /* eslint-enable global-require */

    const waitingPromises = Promise.all([
      cartItemsPromise,
      userConfigPromise,
      translationsConfigPromise,
    ]);

    resolve(waitingPromises);
  }).catch(reject);
});

export default startupPromise;
