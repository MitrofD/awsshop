// @flow
const { ObjectID } = require('mongodb');

const tools = {
  anyAsObj: (data: any): Object => typeof data === 'object' && data !== null ? data : {},
  anyAsStr: (data: any): string => typeof data === 'string' && data !== null ? data : '',
  capitalize: (val: string): string => val.charAt(0).toUpperCase() + val.slice(1),
  dateFromData: (mbDate: any): ?Date => {
    if (mbDate instanceof Date) {
      return mbDate;
    }

    const intVal = parseInt(mbDate);
    const date = new Date(intVal);
    const dateTime = date.getTime();

    if (Number.isNaN(dateTime)) {
      return null;
    }

    return date;
  },

  domainRegExp: /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/i,
  emailRegExp: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  USDPMWalletRegExp: /^U\d{8}$/,
  escapedString: (str: string) => str.replace(/[$[+*|()^?.\\/]/g, '\\$&'),
  getMongoID: (id: MongoID): ObjectID => {
    if (id instanceof ObjectID) {
      return id;
    }

    try {
      const needId = new ObjectID(id);
      return needId;
    } catch (error) {
      throw new Error('Incorrect id');
    }
  },
  has: Object.prototype.hasOwnProperty,
  isArray: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object Array]',
  isObject: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object Object]',
  isString: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object String]',
  isNumber: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object Number]',
  isRegExp: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object RegExp]',
  isFunction: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object Function]',
  isUndefined: (maybyObj: any) => typeof maybyObj === 'undefined',
  isError: (maybyObj: any) => maybyObj instanceof Error,
  passwordRegExp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  urlRegExp: /^(https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/\n]+)((?::\d+)?)/i,
  getPrice: (productInfo: Object) => {
    const price = productInfo.options && productInfo.options.isConfigurable ? productInfo.options.price : productInfo.price;

    return price;
  },
};

module.exports = tools;
