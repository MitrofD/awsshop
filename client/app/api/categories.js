// @flow
import axios from 'axios';
import tools from './tools';

const getWithAttr = (attr: string, val: string): Promise<Object> => {
  const getPromise = new Promise((resolve, reject) => {
    axios.get(`${proxyPath}/category?${attr}=${val}`).then(({ data }) => {
      resolve(data);
    }).catch((error) => {
      const errorObj = new Error(error.response.data);
      reject(errorObj);
    });
  });

  return getPromise;
};

const categories = Object.freeze({
  add(category?: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/categories`, category).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const addError = new Error(error.response.data);
        reject(addError);
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

    const queryStr = `${proxyPath}/categories?${tools.objToQuery(pureQuery)}`;

    const promise = new Promise((resolve, reject) => {
      axios.get(queryStr).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const getError = new Error(error.response.data);
        reject(getError);
      });
    });

    return promise;
  },

  remove(id: string): Promise<void> {
    const promise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/categories/${id}`).then(() => {
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
      axios.put(`${proxyPath}/category/${id}`, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const editError = new Error(error.response.data);
        reject(editError);
      });
    });

    return promise;
  },

  withId: (id: string) => getWithAttr('id', id),

  withName: (name: string) => getWithAttr('name', name),
});

export default categories;
