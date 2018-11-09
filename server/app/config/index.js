// @flow
const path = require('path');

const {
  NODE_ENV,
  PORT,
} = process.env;

RootPath = path.dirname(require.main.filename);
isDevMode = NODE_ENV === 'development';
Port = parseInt(PORT) || 3000;

require('./tools');
require('./enums');
require('./config');
