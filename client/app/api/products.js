// @flow
import axios from 'axios';
import tools from './tools';

const getPromiseWithUrlAndQuery = (url: string, query: any): Promise<Object> => {
  const pureQuery: { [string]: any } = {
    limit: 100,
    skip: 0,
  };

  if (typeof query === 'object' && query !== null) {
    Object.assign(pureQuery, query);
  }

  let queryStr = url;

  if (typeof pureQuery.categoryId === 'string') {
    queryStr += `/${pureQuery.categoryId}`;
    delete pureQuery.categoryId;
  }

  const paramsStr = tools.objToQuery(pureQuery);
  queryStr += `?${paramsStr}`;

  const getPromise = new Promise((resolve, reject) => {
    axios.get(queryStr).then(({ data }) => {
      resolve(data);
    }).catch((error) => {
      const getError = new Error(error.response.data);
      reject(getError);
    });
  });

  return getPromise;
};

const products = Object.freeze({
  add(id: string): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/products/${id}`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const addError = new Error(error.response.data);
        reject(addError);
      });
    });

    return promise;
  },

  get(query: any) {
    return getPromiseWithUrlAndQuery(`${proxyPath}/products`, query);
  },

  getRaw(query: any) {
    return getPromiseWithUrlAndQuery(`${proxyPath}/raw-products`, query);
  },

  remove(id: string): Promise<void> {
    const promise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/products/${id}`).then(() => {
        resolve();
      }).catch((error) => {
        const removeError = new Error(error.response.data);
        reject(removeError);
      });

      return promise;
    });

    return promise;
  },

  update(id: string, newData: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/products/${id}`, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const editError = new Error(error.response.data);
        reject(editError);
      });
    });

    return promise;
  },
});

export default products;
