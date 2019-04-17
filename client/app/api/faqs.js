// @flow
import axios from 'axios';
import tools from './tools';

const faqs = Object.freeze({
  add(item?: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/faqs`, item).then(({ data }) => {
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

    const queryStr = `${proxyPath}/faqs?${tools.objToQuery(pureQuery)}`;

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
      axios.delete(`${proxyPath}/faqs/${id}`).then(() => {
        resolve();
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  update(id: string, newData: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/faqs/${id}`, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },
});

export default faqs;
