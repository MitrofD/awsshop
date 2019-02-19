// @flow
import axios from 'axios';
import tools from './tools';

const CACHE: { [string]: Object } = {};
const subs: { [string]: Function } = {};

let langsList: { [string]: string } = {};
let currLang = '';

const setLang = (lang: string, data: Object) => {
  if (lang === currLang) {
    return;
  }

  currLang = lang;
  CACHE[lang] = data;

  Object.keys(subs).forEach((key) => {
    subs[key]();
  });
};

const translations = Object.freeze({
  config(lang: any): Promise<string> {
    let fullUrl = `${proxyPath}/translationsInfo`;

    if (tools.isString(lang)) {
      fullUrl += `?lang=${lang}`;
    }

    return new Promise((resolve, reject) => {
      axios.get(fullUrl).then(({ data }) => {
        langsList = data.list;
        setLang(data.code, data.data);
        resolve(data.code);
      }).catch((error) => {
        const translationLoadError = new Error(error.response.data);
        reject(translationLoadError);
      });
    });
  },

  data(): Object {
    let rData = {};

    if (currLang) {
      const fromCache = CACHE[currLang];

      if (typeof rData === 'object') {
        rData = { ...fromCache };
      }
    }

    return rData;
  },

  langCode: () => currLang,

  lang: () => (currLang ? langsList[currLang] : currLang),

  langWithCode: (code: string) => langsList[code],

  list: () => Object.assign({}, langsList),

  set(lang: string): Promise<string> {
    const fromCache = CACHE[lang];

    if (fromCache) {
      setLang(lang, fromCache);
      return Promise.resolve(lang);
    }

    return new Promise((resolve, reject) => {
      axios.get(`${proxyPath}/translation?lang=${lang}`).then(({ data }) => {
        setLang(data.code, data.data);
        resolve(data.code);
      }).catch((error) => {
        const translationLoadError = new Error(error.response.data);
        reject(translationLoadError);
      });
    });
  },

  subscribe(handle: Function, fireNow: boolean = false): SubscribeHandler {
    const uKey = tools.generateUKey('trnslt');
    subs[uKey] = handle;

    if (fireNow) {
      handle(currLang);
    }

    return {
      stop() {
        delete subs[uKey];
      },
    };
  },
});

export default translations;
