// @flow
import axios from 'axios';
import tools from './tools';

const getWithAttr = (attr: string, val: string): Promise<Object> => {
  const getPromise = new Promise((resolve, reject) => {
    axios.get(`${proxyPath}/page?${attr}=${val}`).then(({ data }) => {
      resolve(data);
    }).catch((error) => {
      reject(new Error(error.response.data));
    });
  });

  return getPromise;
};

const pages = Object.freeze({
  add(item?: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/pages`, item).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  get(query: any): Promise<Object> {
    const pureQuery = {
      limit: 100,
      skip: 0,
    };

    if (typeof query === 'object' && query !== null) {
      Object.assign(pureQuery, query);
    }

    const queryStr = `${proxyPath}/pages?${tools.objToQuery(pureQuery)}`;

    const promise = new Promise((resolve, reject) => {
      axios.get(queryStr).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  remove(id: string): Promise<void> {
    const promise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/pages/${id}`).then(() => {
        resolve();
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  update(id: string, newData: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/pages/${id}`, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  withId: (id: string) => getWithAttr('id', id),

  withPath: (path: string) => getWithAttr('path', path),
});

export default pages;
