// @flow
const tools = Object.freeze({
  capitalize: (val: string): string => val.charAt(0).toUpperCase() + val.slice(1),
  emailRegExp: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  escapedString: (str: string) => str.replace(/[$[+*|()^?.\\/]/g, '\\$&'),
  has: Object.prototype.hasOwnProperty,
  generateUKey: (prefix: string): string => `${prefix}_${Date.now()}_${Math.random()}`,
  queryToObj: (query: string): Object => {
    const rObj: { [string]: string } = {};
    const decodeQuery = decodeURIComponent(query);
    const keyValParts = decodeQuery.split('&');

    keyValParts.forEach((item) => {
      const [
        key,
        val,
      ] = item.split('=');

      if (key && val) {
        rObj[key] = val;
      }
    });

    return rObj;
  },

  isArray: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object Array]',
  isObject: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object Object]',
  isString: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object String]',
  isNumber: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object Number]',
  isRegExp: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object RegExp]',
  isFunction: (maybyObj: any) => Object.prototype.toString.call(maybyObj) === '[object Function]',
  isUndefined: (maybyObj: any) => typeof maybyObj === 'undefined',
  isError: (maybyObj: any) => maybyObj instanceof Error,
  objToQuery: (obj: Object): string => {
    let rStr = '';
    let sep = '';

    const keys = Object.keys(obj);

    keys.forEach((key) => {
      const val = obj[key];
      rStr += `${sep}${key}=${val}`;
      sep = '&';
    });

    return rStr;
  },

  strForRegExp: (val: string): string => val.replace(/[$[+*|()^?.\\/]/g, '\\$&'),
  urlRegExp: /^(https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/\n]+(?::\d+)?)/iy,
});

export default tools;
