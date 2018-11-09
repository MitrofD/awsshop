// @flow
const SECOND_IN_MS = 1000;
const SECONDS_IN_DAY = 86400;

const defOptions = {
  path: '/',
  httpOnly: false,
  secure: false,
};

const Cookies = {
  parse(str: string): Object {
    const returnObj = {};

    if (!str) {
      return returnObj;
    }

    str.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const prop = parts.shift().trim();
      returnObj[prop] = decodeURI(parts.join('='));
    });

    return returnObj;
  },

  get(name: string, val: string, options?: Object): string {
    const pureOptions = options || {};
    const rOptions = Object.assign({}, defOptions, pureOptions);

    const valParts = [
      name + '=' + val,
      'Path=' + rOptions.path,
    ];

    if (typeof rOptions.expireDays === 'number' && !Number.isNaN(rOptions.expireDays)) {
      const secDuration = rOptions.expireDays * SECONDS_IN_DAY;
      const mscDuration = secDuration * SECOND_IN_MS;
      const timeNow = (new Date()).getTime();
      const expires = new Date(timeNow + mscDuration);
      const expiresAttr = 'Expires=' + expires.toString();
      valParts.push(expiresAttr);
    }

    if (typeof rOptions.domain === 'string') {
      const domainAttr = 'Domain=' + rOptions.domain;
      valParts.push(domainAttr);
    }

    if (rOptions.httpOnly) {
      valParts.push('HttpOnly');
    }

    if (rOptions.secure) {
      valParts.push('Secure');
    }

    return valParts.join(';');
  },
};

module.exports = Cookies;
