// @flow
import axios from 'axios';

const get = Object.freeze({
  getStartOfMonthTime(): Promise<number> {
    const getPromise = new Promise((resolve, reject) => {
      axios.get(`${proxyPath}/data/start-of-month-time`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const getError = new Error(error.response.data);
        reject(getError);
      });
    });

    return getPromise;
  },
});

export default get;
