// @flow
import axios from 'axios';
import tools from './tools';

const user = (function genUserObj() {
  const subs: SubscribesStore = {};
  let lData: ?Object;

  const getCopy = () => (lData ? Object.assign({}, lData) : lData);

  const rObj: { [string]: any } = {
    apply(data: any) {
      if (typeof data === 'object' && data !== null) {
        lData = lData || {};
        Object.assign(lData, data);
      } else {
        lData = null;
      }

      const dataCopy = getCopy();

      Object.keys(subs).forEach((key) => {
        subs[key](dataCopy);
      });
    },

    subscribe(handle: Function, fireNow: boolean = false): SubscribeHandler {
      const uKey = tools.generateUKey('usrSbscrb');
      subs[uKey] = handle;

      if (fireNow) {
        handle(getCopy());
      }

      return {
        stop() {
          delete subs[uKey];
        },
      };
    },

    get: getCopy,

    login(email: string, password: string): Promise<Object> {
      const loginPromise = new Promise((resolve, reject) => {
        axios.post(`${proxyPath}/login`, {
          email,
          password,
        }).then((response) => {
          resolve(response.data);
        }, (error) => {
          const loginError = new Error(error.response.data);
          reject(loginError);
        });
      });

      return loginPromise;
    },

    logout(ignoreRequest: boolean = false): Promise<void> {
      if (ignoreRequest) {
        rObj.apply(null);
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        axios.post(`${proxyPath}/logout`).then(() => {
          rObj.apply(null);
          resolve();
        }, (error) => {
          const logoutError = new Error(error.response.data);
          reject(logoutError);
        });
      });
    },

    config(): Promise<Object> {
      return new Promise((resolve, reject) => {
        axios.get(`${proxyPath}/userInfo`).then(({ data }) => {
          rObj.apply(data);
          resolve(data);
        }, (error) => {
          rObj.apply(null);
          const getUserError = new Error(error.response.data);
          reject(getUserError);
        });
      });
    },
  };

  return rObj;
}());

export default user;
