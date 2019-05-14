// @flow
const SECOND_IN_MS = 1000;
const SECONDS_IN_DAY = 86400;

const defOptions = {
  path: '/',
  httpOnly: false,
  secure: false,
};

const delim = ';';

const Cookies = {
  parse(str: string): Object {
    const returnObj = {};

    if (!str) {
      return returnObj;
    }

    const parts = str.split(delim);
    const partsLength = parts.length;
    let i = 0;

    for (; i < partsLength; i += 1) {
      const part = parts[i];
      const cookieParts = part.split('=');
      const prop = cookieParts[0].trim();
      returnObj[prop] = decodeURI(cookieParts[1]);
    }

    return returnObj;
  },

  get(name: string, val: string, options?: Object): string {
    const pureOptions = options || {};
    const rOptions = Object.assign({}, defOptions, pureOptions);

    const valParts = [
      name + '=' + val,
      'Path=' + rOptions.path,
    ];

    let valPartsLength = valParts.length;

    if (typeof rOptions.expireDays === 'number' && !Number.isNaN(rOptions.expireDays)) {
      const secDuration = rOptions.expireDays * SECONDS_IN_DAY;
      const mscDuration = secDuration * SECOND_IN_MS;
      const timeNow = (new Date()).getTime();
      const expires = new Date(timeNow + mscDuration);
      const expiresAttr = 'Expires=' + expires.toString();
      valParts[valPartsLength] = expiresAttr;
      valPartsLength += 1;
    }

    if (typeof rOptions.domain === 'string') {
      const domainAttr = 'Domain=' + rOptions.domain;
      valParts[valPartsLength] = domainAttr;
      valPartsLength += 1;
    }

    if (rOptions.httpOnly) {
      valParts[valPartsLength] = 'HttpOnly';
      valPartsLength += 1;
    }

    if (rOptions.secure) {
      valParts[valPartsLength] = 'Secure';
      valPartsLength += 1;
    }

    return valParts.join(delim);
  },
};

module.exports = Cookies;
