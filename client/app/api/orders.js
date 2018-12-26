// @flow
import axios from 'axios';
import tools from './tools';
import user from './user';

const DEF_PRODUCTS_COUNT = 0;
const PRODUCTS_COUNT_SUBS = {};
const STATUS = {
  NEW: 'NEW',
  PROCESSED: 'PROCESSED',
  COMPLETED: 'COMPLETED',
};

let productsCount = DEF_PRODUCTS_COUNT;

const applyNewProductsCount = (newProductsCount: number) => {
  productsCount = newProductsCount;

  const subKeys = Object.keys(PRODUCTS_COUNT_SUBS);
  subKeys.forEach((subKey) => {
    const subHandle = PRODUCTS_COUNT_SUBS[subKey];
    subHandle(newProductsCount);
  });
};

user.subscribe((userData) => {
  if (userData) {
    const userProductsCount = parseInt(userData.productsCount) || DEF_PRODUCTS_COUNT;
    applyNewProductsCount(userProductsCount);
    return;
  }

  applyNewProductsCount(DEF_PRODUCTS_COUNT);
}, true);

const getPromiseWithPathAndQuery = (path: string, query: any): Promise<Object> => {
  const pureQuery: { [string]: any } = {
    limit: 100,
    skip: 0,
  };

  if (typeof query === 'object' && query !== null) {
    Object.assign(pureQuery, query);
  }

  let queryStr = proxyPath + path;

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

const orders = Object.freeze({
  STATUS,

  add(id: string): Promise<Object> {
    const addPromise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/orders/${id}`).then(({ data }) => {
        applyNewProductsCount(data.productsCount);
        resolve(data);
      }).catch((error) => {
        const pureError = new Error(error.response.data);
        reject(pureError);
      });
    });

    return addPromise;
  },

  apply(code: string): Promise<void> {
    const applyPromise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/orders/apply/${code}`).then(() => {
        applyNewProductsCount(DEF_PRODUCTS_COUNT);
        resolve();
      }).catch((error) => {
        const applyError = new Error(error.response.data);
        reject(applyError);
      });
    });

    return applyPromise;
  },

  get: (query: any) => getPromiseWithPathAndQuery('/orders', query),

  getCustomer: (query: any) => getPromiseWithPathAndQuery('/orders/customer', query),

  getMy: (query: any) => getPromiseWithPathAndQuery('/orders/my', query),

  getCart(): Promise<Object[]> {
    const getPromise = new Promise((resolve, reject) => {
      axios.get(`${proxyPath}/orders/cart`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const getError = new Error(error.response.data);
        reject(getError);
      });
    });

    return getPromise;
  },

  genOrderId(): Promise<string> {
    const genPromise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/orders/gen-order-id`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const genError = new Error(error.response.data);
        reject(genError);
      });
    });

    return genPromise;
  },

  getProductsCount: () => productsCount,

  remove(id: string): Promise<Object> {
    const removePromise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/orders/${id}`).then(({ data }) => {
        resolve(data);
        applyNewProductsCount(data.productsCount);
      }).catch((error) => {
        const removeError = new Error(error.response.data);
        reject(removeError);
      });
    });

    return removePromise;
  },

  update(orderId: string, updateData: any): Promise<Object> {
    const setPromise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/orders/${orderId}`, updateData).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const setError = new Error(error.response.data);
        reject(setError);
      });
    });

    return setPromise;
  },

  subscribeToCount(handle: Function) {
    const uniqueKey = tools.generateUKey('prdcts_cnt');
    PRODUCTS_COUNT_SUBS[uniqueKey] = handle;

    return {
      stop() {
        delete PRODUCTS_COUNT_SUBS[uniqueKey];
      },
    };
  },
});

export default orders;
