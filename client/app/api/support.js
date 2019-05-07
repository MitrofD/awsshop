// @flow
import axios from 'axios';

const postPromiseWithPath = (path: string, item?: Object): Promise<Object> => {
  const postPromise = new Promise((resolve, reject) => {
    axios.post(`${proxyPath}/support/${path}`, item).then(({ data }) => {
      resolve(data);
    }).catch((error) => {
      reject(new Error(error.response.data));
    });
  });

  return postPromise;
};

const getRequestWithPath = (path: string, query: any): Promise<Object> => {
  const pureQuery = {
    limit: 100,
    skip: 0,
  };

  if (typeof query === 'object' && query !== null) {
    Object.assign(pureQuery, query);
  }

  return Tools.getRequestWithURL(`${proxyPath}/support/${path}`, pureQuery);
};

export default Object.freeze({
  addMessage(item?: Object): Promise<Object> {
    const addPromise = postPromiseWithPath('messages', item);
    return addPromise;
  },

  addSubject(item?: Object): Promise<Object> {
    const addPromise = postPromiseWithPath('subjects', item);
    return addPromise;
  },

  deleteSubject(id: string): Promise<void> {
    const promise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/support/subjects/${id}`).then(() => {
        resolve();
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  getMessages: (query: any): Promise<Object> => getRequestWithPath('messages', query),
  getSubjects: (query: any): Promise<Object> => getRequestWithPath('subjects', query),

  answerToMessage(id: string, answer: string): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/support/messages/answer/${id}`, {
        answer,
      }).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  updateSubject(id: string, newData: Object): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/support/subjects/${id}`, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },
});
