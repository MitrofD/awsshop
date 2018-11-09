// @flow
const crypto = require('crypto');

const pool = 31 * 128;
const dash = '-';
const str = '10000000-1000-4000-8000-100000000000'; // init string
const len = str.length;
const strs = [];
let randomBytes;
let j;

strs.length = len;
strs[8] = dash;
strs[13] = dash;
strs[18] = dash;
strs[23] = dash;

const reset = () => {
  randomBytes = crypto.randomBytes(pool);
  j = 0;
};

reset();

const uuidV4 = (): string => {
  let lastChar = null;

  for (let i = 0; i < len; i += 1) {
    lastChar = str[i];

    if (lastChar === dash || lastChar === '4') {
      strs[i] = lastChar;
      continue;
    }

    j += 1;

    if (j >= randomBytes.length) {
      reset();
    }

    const needVal = lastChar === '8' ? 8 + (randomBytes[j] % 4) : randomBytes[j] % 16;
    strs[i] = needVal.toString(16);
  }

  return strs.join('');
};

module.exports = {
  v4: uuidV4,
};
