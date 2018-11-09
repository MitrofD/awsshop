// @flow
const MongoClient = require('mongodb').MongoClient;

const {
  MONGO_IP,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PASS,
  MONGO_DB,
} = process.env;

const attrInConf = (attrName: string): string => `(${attrName} in .conf)`;

let connectUrl = 'mongodb://';
const cDBName = MONGO_DB ? MONGO_DB.trim() : '';

if (cDBName.length === 0) {
  throw new Error(`Set mongodb database name ${attrInConf('MONGO_DB')}`);
}

if (MONGO_USER || MONGO_PASS) {
  if (!MONGO_USER) {
    throw new Error(`Set mongodb user ${attrInConf('MONGO_USER')}`);
  }

  if (!MONGO_PASS) {
    throw new Error(`Set mongodb password ${attrInConf('MONGO_PASS')}`);
  }

  connectUrl += `${MONGO_USER}:${MONGO_PASS}@`;
}

connectUrl += MONGO_IP || '127.0.0.1';
connectUrl += ':';
connectUrl += MONGO_PORT || 27017;
connectUrl += `/${cDBName}`;

const connectPromise: Promise<void> = new Promise((resolve, reject) => {
  MongoClient.connect(connectUrl, {
    useNewUrlParser: true,
  }, (error, client) => {
    if (error) {
      reject(error);
      return;
    }

    MongoStore = client.db();
    resolve();
  });
});

module.exports = connectPromise;
