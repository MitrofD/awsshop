// @flow
import axios from 'axios';
import tools from './tools';

const basePath = `${proxyPath}/users`;

const putAxiosWithPath = (path: string): Promise<Object> => {
  const promise = new Promise((resolve, reject) => {
    axios.put(basePath + path).then(({ data }) => {
      resolve(data);
    }).catch((error) => {
      const editError = new Error(error.response.data);
      reject(editError);
    });
  });

  return promise;
};

const users = Object.freeze({
  get: (query: any) => tools.getRequestWithURL(basePath, query),

  getLoginsHistory: (query: any) => tools.getRequestWithURL(`${basePath}/logins-history`, query),

  payment: (id: string) => putAxiosWithPath(`/payment/${id}`),

  referralPayment: (id: string) => putAxiosWithPath(`/referral-payment/${id}`),

  update(id: string, newData: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.put(`${basePath}/${id}`, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const editError = new Error(error.response.data);
        reject(editError);
      });
    });

    return promise;
  },
});

export default users;
