// @flow
let IntlR = window.Intl;

if (!IntlR) {
  // eslint-disable-next-line global-require
  IntlR = require('intl');
}

const numFormat = new IntlR.NumberFormat();
window.NumberFormat = numFormat.format;
