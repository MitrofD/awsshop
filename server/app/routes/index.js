// @flow
const express = require('express');
const csrf = require('../api/csrf');

const router = express.Router();

require('./api').call(router);
require('./categories').call(router);
require('./data').call(router);
require('./orders').call(router);
require('./products').call(router);
require('./translations').call(router);
require('./users').call(router);
require('./settings').call(router);

const configData = Object.assign({
  csrfCookieName: csrf.cookieName.toLowerCase(),
}, Config);

router.get('/config', (req, res) => {
  res.json(configData);
});

module.exports = router;
