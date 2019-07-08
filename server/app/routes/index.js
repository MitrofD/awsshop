// @flow
const express = require('express');
const csrf = require('../api/csrf');

const router = express.Router();

require('./api').call(router);
require('./carts').call(router);
require('./categories').call(router);
require('./competition').call(router);
require('./data').call(router);
require('./faqs').call(router);
// require('./orders').call(router);
require('./pages').call(router);
require('./products').call(router);
require('./translations').call(router);
require('./users').call(router);
require('./settings').call(router);
require('./support').call(router);
require('./vacancies').call(router);
require('./solidpayments').call(router);

const configData = Object.assign({
  csrfCookieName: csrf.cookieName.toLowerCase(),
}, Config);

router.get('/config', (req, res) => {
  res.json(configData);
});

module.exports = router;
