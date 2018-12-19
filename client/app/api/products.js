// @flow
import axios from 'axios';
import tools from './tools';
import user from './user';

const DEF_PRODUCTS_COUNT = 0;
const PRODUCTS_COUNT_SUBS = {};

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
  addToCart(id: string): Promise<Object> {
    const addPromise = new Promise((resolve, reject) => {
      axios.put(`${proxyPath}/product/to-cart/${id}`).then(({ data }) => {
        applyNewProductsCount(data.productsCount);
        resolve(data);
      }).catch((error) => {
        const pureError = new Error(error.response.data);
        reject(pureError);
      });
    });

    return addPromise;
  },

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

  getMy: (query: any) => getPromiseWithPathAndQuery('/my-products', query),

  getRaw: (query: any) => getPromiseWithPathAndQuery('/raw-products', query),

  getShoppingCartProducts(): Promise<Object[]> {
    const getPromise = new Promise((resolve, reject) => {
      axios.get(`${proxyPath}/shopping-cart-products`).then(({ data }) => {
        resolve(data);
      }).catch((error) => {
        const getError = new Error(error.response.data);
        reject(getError);
      });
    });

    return getPromise;
  },

  getProductsCount: () => productsCount,

  rawDelete: (id: string) => deletePromiseWithPath(`/raw-products/${id}`),

  removeFromCart(id: string): Promise<Object> {
    const removePromise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/products/from-cart/${id}`).then(({ data }) => {
        resolve(data);
        applyNewProductsCount(data.productsCount);
      }).catch((error) => {
        const removeError = new Error(error.response.data);
        reject(removeError);
      });
    });

    return removePromise;
  },

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

  setPause(id: string, isPaused: boolean): Promise<Object> {
    const updatePromise = this.update(id, {
      isPaused,
    });

    return updatePromise;
  },

  subscribeToProductsCount(handle: Function) {
    const uniqueKey = tools.generateUKey('prdcts_cnt');
    PRODUCTS_COUNT_SUBS[uniqueKey] = handle;

    return {
      stop() {
        delete PRODUCTS_COUNT_SUBS[uniqueKey];
      },
    };
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
