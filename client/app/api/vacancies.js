// @flow
import axios from 'axios';
import tools from './tools';

const exportObj = Object.freeze({
  add(item?: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/vacancy`, item).then(({ data }) => {
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

    const queryStr = `${proxyPath}/vacancies?${tools.objToQuery(pureQuery)}`;

    const promise = new Promise((resolve, reject) => {
      axios.get(queryStr).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  delete(id: string): Promise<void> {
    const promise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/vacancy/${id}`).then(() => {
        resolve();
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  update(id: string, newData: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/vacancy/${id}`, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  withId(id: string): Promise<Object> {
    const getPromise = new Promise((resolve, reject) => {
      axios.get(`${proxyPath}/vacancy/${id}`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return getPromise;
  },
});

export default exportObj;
