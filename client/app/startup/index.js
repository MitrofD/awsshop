// @flow
import axios from 'axios';

const applyClientConfig = (data: Object): Object => {
  const advancedData = {
    accountCenterPath: '/account',
    adminPath: '/admin',
    inputTimeout: 150,
  };

  return Object.assign(advancedData, data);
};

const startupPromise: Promise<any[]> = new Promise((resolve, reject) => {
  axios.get('/call/config').then(({ data }) => {
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
