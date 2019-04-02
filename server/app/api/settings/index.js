// @flow
const fs = require('fs');
const tools = require('../tools');
const { random, alphabet } = require('../random');

const tokenLength = 12;
const tokenAlphabet = alphabet.lowerChars + alphabet.numbers + alphabet.upperChars;

const isPositiveNumb = (val: any): number => {
  const pureNumb = parseFloat(val) || 0;

  if (pureNumb === 0) {
    throw new Error('Has to be greater zero');
  }

  return pureNumb;
};

const isStringWithLength = (val: any, length: number): string => {
  const pString = tools.anyAsStr(val);

  if (pString.length !== length) {
    throw new Error(`Length has to be ${length}`);
  }

  return pString;
};

const OPTIONS = {
  TOKEN: {
    default: random(tokenAlphabet, tokenLength),
    getPure: (val: any) => isStringWithLength(val, tokenLength),
  },

  DELIVERY_PRICE: {
    default: 30,
    getPure: isPositiveNumb,
  },

  PROFIT_PRICE: {
    default: 100,
    getPure: isPositiveNumb,
  },

  PROFIT_PRICE_PERC: {
    default: 10,
    getPure: isPositiveNumb,
  },

  PURCHASE_PRICE: {
    default: 40,
    getPure: isPositiveNumb,
  },

  PURCHASE_PRICE_PERC: {
    default: 10,
    getPure: isPositiveNumb,
  },

  REF_PURCHASE_PRICE: {
    default: 2,
    getPure: isPositiveNumb,
  },
};

let CURR_OPTIONS = {};

const FILE_PATH = `${__dirname}/data.json`;

const getDefaultOptions = (): Object => {
  const optionKeys = Object.keys(OPTIONS);
  const optionKeysLength = optionKeys.length;
  const rObj = {};
  let oI = 0;

  for (; oI < optionKeysLength; oI += 1) {
    const option = optionKeys[oI];
    const value = OPTIONS[option];
    rObj[option] = value.default;
  }

  return rObj;
};

const getPureSettings = (dOptions: any): Object => {
  const pOptions = tools.anyAsObj(dOptions);
  const pOptionKeys = Object.keys(pOptions);
  const pOptionKeysLength = pOptionKeys.length;
  const retObj = {};
  let oI = 0;

  for (; oI < pOptionKeysLength; oI += 1) {
    const pOption = pOptionKeys[oI];

    if (tools.has.call(OPTIONS, pOption)) {
      const option = OPTIONS[pOption];
      const dValue = pOptions[pOption];

      try {
        const pValue = option.getPure(dValue);
        retObj[pOption] = pValue;
        // eslint-disable-next-line no-empty
      } catch (gPError) {}
    }
  }

  return retObj;
};

const getInitSettings = async (): Promise<Object> => {
  const getPromise = new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, 'utf8', (error, data) => {
      const defaultOptions = getDefaultOptions();

      if (error) {
        if (error.code === 'ENOENT') {
          resolve(defaultOptions);
          return;
        }

        reject(error);
        return;
      }

      const jsonData = JSON.parse(data);

      if (typeof jsonData !== 'object' || jsonData === null) {
        const notDataError = new Error(`File "${FILE_PATH}" has incorrect data`);
        reject(notDataError);
        return;
      }

      const pureSettings = getPureSettings(jsonData);
      const rData = Object.assign({}, defaultOptions, pureSettings);
      resolve(rData);
    });
  });

  return getPromise;
};

const setOptionsToFile = async (options: Object): Promise<void> => {
  const optionsAsStr = JSON.stringify(options);

  const savePromise = new Promise((resolve, reject) => {
    fs.writeFile(FILE_PATH, optionsAsStr, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  return savePromise;
};

const notExistsTextForOption = (option: any) => `Option "${option}" not exists`;

const settings = Object.freeze({
  async set(dOptions: any): ErrorsPromise<Object> {
    const errors = {};
    const pOptions = tools.anyAsObj(dOptions);
    const pOptionKeys = Object.keys(pOptions);
    const pOptionKeysLength = pOptionKeys.length;
    const saveOptions = {};
    let oI = 0;

    for (; oI < pOptionKeysLength; oI += 1) {
      const dOption = pOptionKeys[oI];
      const pOption = tools.anyAsStr(dOption);
      const dValue = pOptions[dOption];

      if (!tools.has.call(OPTIONS, pOption)) {
        errors[pOption] = notExistsTextForOption(dOption);
        continue;
      }

      const option = OPTIONS[pOption];
      let pureValue = option.default;

      try {
        pureValue = option.getPure(dValue);
      } catch (error) {
        errors[pOption] = error.message;
        continue;
      }

      saveOptions[pOption] = pureValue;
    }

    const tSaveOptions = Object.assign({}, CURR_OPTIONS, saveOptions);

    await setOptionsToFile(tSaveOptions);
    CURR_OPTIONS = tSaveOptions;

    return {
      errors,
      data: tSaveOptions,
    };
  },

  async setOption(dOption: any, dValue: any): Promise<any> {
    const pOption = tools.anyAsStr(dOption);

    if (tools.has.call(OPTIONS, pOption)) {
      const option = OPTIONS[pOption];
      const pValue = option.getPure(dValue);
      const saveOptions = Object.assign({}, CURR_OPTIONS);
      saveOptions[pOption] = pValue;
      await setOptionsToFile(saveOptions);

      return pValue;
    }

    throw new Error(notExistsTextForOption(dOption));
  },

  get: () => Object.assign({}, CURR_OPTIONS),

  getOption(dOption: any): any {
    const pOption = tools.anyAsStr(dOption);

    if (tools.has.call(CURR_OPTIONS, pOption)) {
      return CURR_OPTIONS[pOption];
    }

    throw new Error(notExistsTextForOption(dOption));
  },

  getFloatOption(dOption: any): number {
    const pValue = this.getOption(dOption);
    return parseFloat(pValue) || 0;
  },
});

const retObj: Promise<Object> = new Promise((resolve, reject) => {
  getInitSettings().then((options) => {
    CURR_OPTIONS = options;
    resolve(settings);
  }).catch(reject);
});

module.exports = retObj;
