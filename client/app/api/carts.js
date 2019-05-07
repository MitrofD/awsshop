// @flow
import axios from 'axios';
import tools from './tools';

const INFO_SUBS = {};

let items: Object[] = [];
let quantity = 0;
let summ = 0;

const getInfo = () => {
  const retObj = {
    items,
    quantity,
    summ,
  };

  return retObj;
};

const sendNewData = () => {
  const subKeys = Object.keys(INFO_SUBS);
  const subKeysLength = subKeys.length;
  const info = getInfo();
  let i = 0;

  for (; i < subKeysLength; i += 1) {
    const key = subKeys[i];
    const handle = INFO_SUBS[key];
    handle(info);
  }
};

const itemsHasBeenChanged = () => {
  const itemsLength = items.length;
  let newSumm = 0;
  let newQuantity = 0;
  let i = 0;

  for (; i < itemsLength; i += 1) {
    const item = items[i];
    newQuantity += item.quantity;
    const itemSumm = item.quantity * item.price;
    newSumm += itemSumm;
  }

  quantity = newQuantity;
  summ = newSumm;
  sendNewData();
};

const getItemIdxWithId = (id: string): number => {
  const itemsLength = items.length;
  let i = 0;

  for (; i < itemsLength; i += 1) {
    const item = items[i];

    if (item._id === id) {
      return i;
    }
  }

  return -1;
};

const rObj = Object.seal({
  getInfo,

  add(productId: string, mbOptions?: Object): Promise<Object> {
    const options = typeof mbOptions === 'object' && mbOptions !== null ? mbOptions : {};
    const sendData = Object.assign({
      productId,
    }, options);

    const promise = new Promise((resolve, reject) => {
      axios.post(`${proxyPath}/carts`, sendData).then(({ data }) => {
        const itemIdx = getItemIdxWithId(data._id);

        if (itemIdx !== -1) {
          const item = items[itemIdx];
          quantity -= item.quantity;
          summ -= item.quantity * item.price;
          items[itemIdx] = data;
        } else {
          items.splice(0, 0, data);
        }

        quantity += data.quantity;
        summ += data.quantity * data.price;
        sendNewData();
        resolve(data);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  delete(id: string): Promise<Object> {
    const promise = new Promise((resolve, reject) => {
      axios.delete(`${proxyPath}/carts?id=${id}`).then(({ data }) => {
        const itemIdx = getItemIdxWithId(data._id);

        if (itemIdx !== -1) {
          const item = items[itemIdx];
          quantity -= item.quantity;
          summ -= item.quantity * item.price;
          items.splice(itemIdx, 1);
          sendNewData();
        }

        resolve(data);
      }).catch((error) => {
        console.log(error);
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  get(): Promise<Object[]> {
    const promise = new Promise((resolve, reject) => {
      axios.get(`${proxyPath}/carts`).then(({ data }) => {
        items = data;

        itemsHasBeenChanged();
        const info = this.getInfo();
        resolve(info);
      }).catch((error) => {
        reject(new Error(error.response.data));
      });
    });

    return promise;
  },

  subsToInfo(handle: Function) {
    const uniqueKey = tools.generateUKey('crt_inf');
    INFO_SUBS[uniqueKey] = handle;

    return {
      stop() {
        delete INFO_SUBS[uniqueKey];
      },
    };
  },
});

export default rObj;
