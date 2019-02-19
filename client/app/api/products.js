// @flow
import axios from 'axios';
import tools from './tools';

const getPromiseWithPathAndQuery = (path: string, query: any): Promise<Object> => {
  const pureQuery: { [string]: any } = {
    limit: 100,
    skip: 0,
  };

  if (typeof query === 'object' && query !== null) {
    Object.assign(pureQuery, query);
  }

  let queryStr = proxyPath + path;

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

const deletePromiseWithPath = (path: string): Promise<Object> => {
  const promise = new Promise((resolve, reject) => {
    axios.delete(proxyPath + path).then(({ data }) => {
      resolve(data);
    }).catch((error) => {
      const removeError = new Error(error.response.data);
      reject(removeError);
    });

    return promise;
  });

  return promise;
};

const products = Object.freeze({
  delete: (id: string) => deletePromiseWithPath(`/my-products/${id}`),

  get: (query: any) => getPromiseWithPathAndQuery('/products', query),

  getById(id: string): Promise<Object> {
    const getPromise = new Promise((resolve, reject) => {
      axios.get(`${proxyPath}/products/id/${id}`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const getError = new Error(error.response.data);
        reject(getError);
      });
    });

    return getPromise;
  },

  getAdmin: (query: any) => getPromiseWithPathAndQuery('/admin-products', query),

  getMy: (query: any) => getPromiseWithPathAndQuery('/my-products', query),

  getRaw: (query: any) => getPromiseWithPathAndQuery('/raw-products', query),

  rawDelete: (id: string) => deletePromiseWithPath(`/raw-products/${id}`),

  push(id: string, pushData: any): Promise<Object> {
    const pureData = typeof pushData === 'object' && pushData !== null ? pushData : {};

    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/products/${id}`, pureData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const pushError = new Error(error.response.data);
        reject(pushError);
      });
    });

    return promise;
  },

  setApprove(id: string, isApproved: boolean): Promise<Object> {
    const updatePromise = this.update(id, {
      isApproved,
    });

    return updatePromise;
  },

  setPause(id: string, isPaused: boolean): Promise<Object> {
    const updatePromise = this.update(id, {
      isPaused,
    });

    return updatePromise;
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
