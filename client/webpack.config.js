'use-strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const has = Object.prototype.hasOwnProperty;
const jsFileRegExp = /\.jsx?$/;
const devMode = 'development';
const mode = process.env.NODE_ENV || devMode;
const isDevMode = mode === devMode;
const appPath = path.resolve(__dirname, 'app');
const bundlePath = path.resolve(__dirname, 'bundle');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const libsDirName = 'libs';
const libsPath = `/${libsDirName}/`;
const port = 3000;
const proxyPath = isDevMode ? '/dev' : '';
const publicPath = '/';
const styleFilename = 'style.css';

const entryPoints = (function fillData() {
  const htmlFiles = {};
  const htmlRegExp = /\.html$/;
  const retPoints = {};
  const files = fs.readdirSync(appPath);
  const filesLength = files.length;
  let i = 0;

  for (; i < filesLength; i += 1) {
    const file = files[i];
    const filePath = appPath + publicPath + file;
    const jsMatches = file.match(jsFileRegExp);

    if (jsMatches) {
      const ext = jsMatches[0];
      const fileName = file.substr(0 , file.length - ext.length);
      retPoints[fileName] = filePath;
      continue;
    }

    const htmlMatches = file.match(htmlRegExp);

    if (htmlMatches) {
      const ext = htmlMatches[0];
      const fileName = file.substr(0 , file.length - ext.length);
      htmlFiles[fileName] = filePath;
    }
  }

  const htmlFileKeys = Object.keys(htmlFiles);
  const htmlFilesLength = htmlFileKeys.length;
  const scriptTagRegExp = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const styleTagRegExp = /.*link.*href=["|\']?(.*[\\\|\/]?.*)\.css["|\']?.*/gi;
  i = 0;

  for (; i < htmlFilesLength; i += 1) {
    const filename = htmlFileKeys[i];
    const filepath = htmlFiles[filename];

    let data = fs.readFileSync(filepath, {
      encoding: 'utf-8',
    });

    data = data.replace(scriptTagRegExp, '');
    data = data.replace(styleTagRegExp, '');
    data += `<link href="${publicPath + styleFilename}" rel="stylesheet">`;

    if (has.call(retPoints, filename)) {
      data += `<script charset="utf-8" src="${publicPath + filename}.js"></script>`;
    }

    fs.writeFile(filepath, data, (writeError) => {
      if (writeError) {
        throw writeError;
      }
    });
  }

  return retPoints;
}());

const cssLoaders = [
  'thread-loader',
  {
    loader: 'css-loader',
    options: {
      sourceMap: isDevMode,
    },
  },
];

if (isDevMode) {
  cssLoaders.splice(1, 0, 'style-loader');
} else {
  cssLoaders.splice(0, 0, {
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: isDevMode,
    },
  });
}

const scssLoaders = cssLoaders.slice();
scssLoaders.push({
  loader: 'fast-sass-loader',
  options: {
    sourceMap: isDevMode,
  },
});

const config = {
  mode,
  context: appPath,
  entry: entryPoints,
  module: {
    rules: [
      {
        test: jsFileRegExp,
        exclude: nodeModulesPath,
        use: [
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      }, {
        test: /\.css$/,
        use: cssLoaders,
      }, {
        test: /\.scss$/,
        exclude: nodeModulesPath,
        use: scssLoaders,
      }, {
        test: /\.(ico|ttf|eot|woff|woff2|svg|png|gif|jpe?g)$/,
        exclude: nodeModulesPath,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ]
      },
    ],
  },
  resolve: {
    alias: {
      warning: path.resolve(__dirname, 'node_modules/warning'),
      'hoist-non-react-statics': path.resolve(__dirname, 'node_modules/hoist-non-react-statics'),
      'prop-types': path.resolve(__dirname, 'node_modules/prop-types')
    },
    extensions: [
      '.js',
      '.jsx',
      '.json',
    ],
  },
  watch: isDevMode,
  watchOptions: {
    aggregateTimeout: 100,
  },
  devtool: 'eval',
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize: 500000,
  },
  plugins: [],
  optimization: {},
  output: {
    publicPath,
    path: bundlePath,
    filename: '[name].js',
  },
  devServer: {
    port,
    clientLogLevel: 'none',
    historyApiFallback: true,
    hot: true,
    stats: {
      all: false,
      modules: true,
      maxModules: 0,
      errors: true,
      warnings: true,
    },
    proxy: {
      [proxyPath]: {
        target: `http://localhost:${port + 1}`,
        pathRewrite: {
          [`^${proxyPath}`]: '',
        },
      },
    },
    open: true,
    overlay: {
      errors: true,
    },
  },
  target: 'web',
};

const minimazer = [];
const plugins = [
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    proxyPath: JSON.stringify(proxyPath),
    isDevMode: JSON.stringify(isDevMode),
  }),
  new MiniCssExtractPlugin({
    filename: styleFilename,
  }),
  new CopyWebpackPlugin([{
    from: appPath + libsPath,
    to: libsDirName,
  }, {
    context: appPath,
    from: '*.html',
    to: bundlePath,
    force: true,
  }]),
];

// Dev mode...
if (isDevMode) {
  config.module.rules.push({
    test: jsFileRegExp,
    enforce: 'pre',
    exclude: nodeModulesPath,
    use: [
      'thread-loader',
      {
        loader: 'eslint-loader',
        options: {
          cache: true,
        },
      },
    ],
  });

  config.resolve.alias['react-dom'] = '@hot-loader/react-dom';

  Array.prototype.push.apply(plugins, [
    new DuplicatePackageCheckerPlugin({
      emitError: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ]);

// Production mode
} else {
  Array.prototype.push.apply(minimazer, [
    new TerserWebpackPlugin({
      cache: true,
      parallel: true,
      exclude: nodeModulesPath,
      terserOptions: {
        mangle: true,
        warnings: false,
        compress: true,
        ie8: true,
        output: {
          comments: false,
          beautify: false,
        },
      },
    }),
    new OptimizeCSSAssetsPlugin(),
  ]);

  config.devtool = false;
}

config.optimization.minimizer = minimazer;
config.plugins = plugins;

module.exports = config;
