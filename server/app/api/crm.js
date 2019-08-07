// @flow
const request = require('request');

const crmUrlWithAction = (action: string): string => {
  const option = 'CRM_URL';
  const crmUrl: string = Settings.getOption(option);

  if (typeof crmUrl !== 'string' || crmUrl.length === 0) {
    throw new Error(`${option} option not set`);
  }

  return `${crmUrl}?modul=synch&action=${action}&site=${Config.url}`;
};

const rObj = Object.freeze({
  payout(data: any): Promise<void> {
    let url = '';

    try {
      url = crmUrlWithAction('client_payout_callback');
    } catch (error) {
      return Promise.reject(error);
    }

    const promise = new Promise((resolve, reject) => {
      request.post({
        url,
        form: data,
      }, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    return promise;
  },
});

module.exports = rObj;
