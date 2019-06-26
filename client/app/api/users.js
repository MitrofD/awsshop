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

  getRefPaymentsHistory: (query: any) => tools.getRequestWithURL(`${basePath}/ref-payments-history`, query),

  getPaymentsByMonth: (query: any) => tools.getRequestWithURL(`${basePath}/payments-by-month`, query),

  getPayments: (query: any) => tools.getRequestWithURL(`${basePath}/payments`, query),

  getSoldProducts: (query: any) => tools.getRequestWithURL(`${basePath}/sold-products`, query),

  getSoldProductHistory: (productId: string, query: any) => tools.getRequestWithURL(`${basePath}/sold-product-history/${productId}`, query),

  waitingForPayment: () => tools.getRequestWithURL(`${basePath}/waiting-for-payment`),

  refWaitingForPayment: () => tools.getRequestWithURL(`${basePath}/ref-waiting-for-payment`),

  paymentCurr: (id: string) => putAxiosWithPath(`/payment-curr/${id}`),

  paymentStartOfMonth: (id: string) => putAxiosWithPath(`/payment-som/${id}`),

  paymentOnTheSameMonth: (id: string) => putAxiosWithPath(`/payment-otsd/${id}`),

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
