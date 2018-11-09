// @flow
const router = require('express').Router();
require('./categories').call(router);
require('./users').call(router);
require('./translations').call(router);

router.get('/config', (req, res) => {
  res.json(Config);
});

module.exports = router;
