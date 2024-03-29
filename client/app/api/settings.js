// @flow
import tools from './tools';

const storage = window.localStorage || {};
const keyPrefix = 's_';
const callbacks: { [string]: Function } = {};

const OPTION: { [string]: string } = {
  CURR_LANG: 'CURR_LANG',
};

const throwErrorIfNotExists = (option: string) => {
  if (!Object.prototype.hasOwnProperty.call(OPTION, option)) {
    throw new Error(`Option "${option}" not exists`);
  }
};

const settings = Object.freeze({
  get(option: string) {
    throwErrorIfNotExists(option);
    return storage[keyPrefix + option];
  },

  set(option: string, value: string) {
    throwErrorIfNotExists(option);
    const oldVal = this.get(option);

    if (oldVal === value) {
      return;
    }

    const optionKey = keyPrefix + option;

    if (value === null) {
      delete storage[optionKey];
    } else {
      storage[optionKey] = value;
    }

    Object.keys(callbacks).forEach((key) => {
      callbacks[key](option, value);
    });
  },

  subscribe(handler: Function, uKey?: string): SubscribeHandler {
    const rUKey = uKey || tools.generateUKey('sttngs');
    callbacks[rUKey] = handler;

    return {
      stop() {
        delete callbacks[rUKey];
      },
    };
  },
});

export { OPTION };
export default settings;
