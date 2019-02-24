// @flow
let IntlR = window.Intl;

if (!IntlR) {
  // eslint-disable-next-line global-require
  IntlR = require('intl');
}

const numFormat = new IntlR.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

window.NumberFormat = numFormat.format;
