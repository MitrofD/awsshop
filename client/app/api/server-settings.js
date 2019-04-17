// @flow
import axios from 'axios';
import tools from './tools';

const basePath = `${proxyPath}/settings`;

const serverSettings = {
  get: () => tools.getRequestWithURL(basePath),

  set(newData: any): Promise<Object> {
    const savePromise = new Promise((resolve, reject) => {
      axios.put(basePath, newData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const saveError = new Error(error.response.data);
        reject(saveError);
      });
    });

    return savePromise;
  },
};

export default serverSettings;
