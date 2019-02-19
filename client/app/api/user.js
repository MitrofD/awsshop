// @flow
import axios from 'axios';
import tools from './tools';

const user = (function genUserObj() {
  const subs: SubscribesStore = {};
  const basePath = `${proxyPath}/users`;
  let lData: ?Object;

  const getCopy = () => (lData ? Object.assign({}, lData) : lData);

  const apply = (data: any) => {
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
  };

  const updateWithPath = (path: string, newData: Object): Promise<Object> => {
    const promise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/${path}`, newData).then(({ data }) => {
        if (!data.errors) {
          apply(data);
        }

        resolve(data);
      }).catch((error) => {
        const editError = new Error(error.response.data);
        reject(editError);
      });
    });

    return promise;
  };

  const rObj = {
    apply,

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

    get: getCopy,

    getInvitedUsers: (query: any) => tools.getRequestWithURL(`${basePath}/invited-users`, query),

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

    update: (newData: Object) => updateWithPath('users', newData),

    safeUpdate: (newData: Object) => updateWithPath('safe-users', newData),

    subscribe(handle: Function, fireNow: boolean = false): SubscribeHandler {
      const uKey = tools.generateUKey('usr');
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
  };

  return Object.freeze(rObj);
}());

export default user;
