import axios from 'axios';

const competition = Object.freeze({
  deleteMembers() {
    const promise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/competition-members`).then(() => {
        resolve();
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  getMembers() {
    const promise = new Promise((resolve, reject) => {
      axios.get(`${proxyPath}/competition-members`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  generateMembers() {
    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/competition-members`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },
});

export default competition;
