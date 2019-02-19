// @flow
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('./config');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

const appError = (error) => {
  const pathText = error.path ? `\n(Path: ${error.path})` : '';
  // eslint-disable-next-line no-console
  console.log(`🐛 \x1b[31m${error.message} ${pathText}\x1b[37m`);
  process.exit(1);
};

if (!Config.isDevMode) {
  process.on('uncaughtException', appError);
  process.on('unhandledRejection', appError);
}

(function serverSettings() {
  const certFilesPath = process.env.CERT_FILES_PATH;

  if (Config.isSecure && certFilesPath) {
    const certExtension = 'pem';
    const certFN = `cert.${certExtension}`;
    const keyFN = `key.${certExtension}`;

    const serverOptions = {
      cert: fs.readFileSync(certFilesPath + certFN),
      key: fs.readFileSync(certFilesPath + keyFN),
    };

    Server = https.createServer(serverOptions, app);
  } else {
    Server = http.createServer(app);
  }
}());

require('./startup').then(() => {
  // eslint-disable-next-line global-require
  const appRoutes = require('./routes');
  app.use(appRoutes);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(406).end(err.message);
  });

  if (!isDevMode) {
    const publicPath = `${__dirname}/public`;
    const indexPath = `${publicPath}/index.html`;

    app.use(express.static(publicPath));
    app.get('*', (req, res) => {
      res.set('Content-type', 'text/html');
      res.sendFile(indexPath);
    });
  }

  Server.listen(Port.toString(), (error) => {
    if (error) {
      appError(error);
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`\n\x1b[1m\x1b[32m[[[ Running on ${Config.url} ]]]\x1b[37m\x1b[0m`);
  });
}).catch(appError);
