// @flow
import axios from 'axios';

const applyClientConfig = (data: Object): Object => {
  const advancedData = {
    adminPath: '/admin',
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
    const userConfigPromise = require('./user');
    const translationsConfigPromise = require('./translations');
    /* eslint-enable global-require */

    const waitingPromises = Promise.all([
      userConfigPromise,
      translationsConfigPromise,
    ]);

    resolve(waitingPromises);
  }).catch((error) => {
    const loadConfigError = new Error(error.response.data);
    reject(loadConfigError);
  });
});

module.exports = startupPromise;
