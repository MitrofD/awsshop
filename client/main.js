const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const proxy = require('http-proxy-middleware');
const open = require('open');

const logLevel = 'info';
const localhost = 'http://localhost';
const port = parseInt(process.env.PORT) || 3000;
const webpackCompiler = webpack(webpackConfig);

const app = express();
app.disable('x-powered-by');

// Proxy settings ...
(function configProxy() {
  const proxyPath = '/dev';

  app.use(proxyPath, proxy({
    logLevel,
    target: `${localhost}:${port + 1}`,
    pathRewrite: {
      [`^${proxyPath}`]: '',
    },
  }));
}());

// Dev middleware settings ...
const webpackDevMiddlewareInstance = (require('webpack-dev-middleware'))(webpackCompiler, {
  logLevel,
  publicPath: webpackConfig.output.publicPath,
  stats: 'errors-only',
  progress: true,
  inline: true,
  pureSFC: false,
  hot: true,
});

app.use(webpackDevMiddlewareInstance);

// Hot middleware settings ...
app.use(require('webpack-hot-middleware')(webpackCompiler, {
  log: false,
  path: '/__hmr',
}));

const indexFile = path.join(webpackCompiler.outputPath, 'index.html');

app.get('*', (req, res, next) => {
  webpackCompiler.outputFileSystem.readFile(indexFile, (err, result) => {
    if (err) {
      return next(err);
    }

    res.set('Content-type','text/html');
    res.send(result);
    res.end();
  });
});

// Startup is valid build ...
webpackDevMiddlewareInstance.waitUntilValid(() => {
  app.listen(port.toString(), (error) => {
    if (error) {
      throw error;
    }

    open(`${localhost}:${port}`);
  });
});
