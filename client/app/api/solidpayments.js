// @flow
import axios from 'axios';
import tools from './tools';

const rObj = Object.seal({
  getCheckoutId(sendData: Object): Promise<string> {
    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/getCheckoutId`, sendData).then(({ data: checkoutId }) => {
        resolve(checkoutId);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  getOrderInfo(id: string): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/getOrderInfo`, { id }).then(({ data: response }) => {
        resolve(response);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },
});

export default rObj;
