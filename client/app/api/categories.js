// @flow
import axios from 'axios';
import tools from './tools';

const Categories = {
  add(category?: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.post('/call/categories', category).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const addError = new Error(error.response.data);
        reject(addError);
      });
    });

    return promise;
  },

  get(skip?: number, query: any): Promise<Object> {
    const pureObj = {
      limit: 100,
    };

    if (typeof query === 'object' && query !== null) {
      Object.assign(pureObj, query);
    }

    let queryStr = '/call/categories/';

    if (typeof skip === 'number') {
      queryStr += skip;
    }

    const paramsStr = tools.objToQuery(pureObj);
    queryStr += `?${paramsStr}`;

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
      axios.delete(`/call/categories/${id}`).then(() => {
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
      axios.put(`/call/categories/${id}`, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const editError = new Error(error.response.data);
        reject(editError);
      });
    });

    return promise;
  },
};

export default Categories;
