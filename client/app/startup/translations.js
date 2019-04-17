// @flow
import settings, { OPTION } from '../api/settings';
import translations from '../api/translations';
import { apply } from '../components/TranslateElement';

const applyLanguage = () => {
  const currLang = translations.langCode() || '';
  const translationData = translations.data();
  settings.set(OPTION.CURR_LANG, currLang);
  apply(translationData);
  RootNode.addClass(currLang, 'lang');
};

const userLanguage = settings.get(OPTION.CURR_LANG);
const translationsPromise = translations.config(userLanguage);

translationsPromise.then(() => {
  applyLanguage();

  translations.subscribe(() => {
    applyLanguage();
  });
}).catch(Tools.emptyRejectExeption);

export default translationsPromise;
