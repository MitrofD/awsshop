// @flow
const fs = require('fs');
const path = require('path');
const tools = require('../tools');

type Translation = {
  code: string,
  data: Object
};

const sourcePath = path.resolve(__dirname, 'sources');
const DATA: { [string]: Translation } = {};
const LIST: { [string]: string } = {};
let defLang = 'en';
let alreadyInit = false;

const translations = Object.freeze({
  list: () => Object.assign({}, LIST),

  forLangOrDef(lang?: string): Translation {
    let rLang = defLang;

    if (lang && tools.has.call(DATA, lang)) {
      rLang = lang;
    }

    const data = Object.assign({}, DATA[rLang]);

    return {
      data,
      code: rLang,
    };
  },
});

async function genTranslations(): Promise<Object> {
  if (alreadyInit) {
    return translations;
  }

  return new Promise((resolve, reject) => {
    fs.readdir(sourcePath, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      const allPromises: Array<Promise<void>> = [];
      let stopIt = false;

      files.forEach((fileName) => {
        if (stopIt) {
          return;
        }

        const itemPromise = new Promise((iResolve, iReject) => {
          const fileFullPath = path.join(sourcePath, fileName);

          fs.stat(fileFullPath, (statError, stats) => {
            if (!stats.isFile()) {
              iResolve();
              return;
            }

            if (statError) {
              stopIt = true;
              iReject(statError);
              return;
            }

            fs.readFile(fileFullPath, 'utf8', (readError, readData) => {
              if (readError) {
                stopIt = true;
                iReject(readError);
                return;
              }

              const obj = JSON.parse(readData);

              if (typeof obj.data !== 'object' || typeof obj.title !== 'string') {
                stopIt = true;
                iReject(new Error(`File "${fileFullPath}" has incorerct format`));
                return;
              }

              const langName = fileName.split('.')[0];
              DATA[langName] = obj.data;
              LIST[langName] = obj.title;
              iResolve();
            });
          });
        });

        allPromises.push(itemPromise);
      });

      Promise.all(allPromises).then(() => {
        const availableKeys = Object.keys(DATA);

        if (availableKeys.length === 0) {
          const noHaveLangsError = new Error('Please create any language file');
          reject(noHaveLangsError);
          return;
        }

        if (!tools.has.call(availableKeys, defLang)) {
          defLang = availableKeys[0];
        }

        alreadyInit = true;
        resolve(translations);
      }).catch(reject);
    });
  });
}

module.exports = genTranslations;
