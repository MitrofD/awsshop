'use-strict';

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const HTMLWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// paths ...
const appPath = path.resolve(__dirname, 'app');
const bundlePath = path.resolve(__dirname, 'bundle');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const libsDirName = 'libs';
const libsPath = `/${libsDirName}/`;
const isDevMode = process.env.NODE_ENV === 'development';

const config = {
  context: appPath,
  entry: [
    '/',
  ],
  node: {
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: nodeModulesPath,
        options: {
          cacheDirectory: true,
        },
      }, {
        test: /\.s?css$/,
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              sourceMap: isDevMode,
            },
          }, {
            loader: 'sass-loader',
            options: {
              sourceMap: isDevMode,
            },
          },
        ],
      }, {
        test: /\.(ico|ttf|eot|woff|woff2|svg|png|jpe?g)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.json',
    ],
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 100,
  },
  devtool: 'eval',
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize: 500000,
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      libsPath,
      isDevMode: JSON.stringify(isDevMode),
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new HTMLWebpackPlugin({
      template: `${appPath}/index.html`,
    }),
    new CopyWebpackPlugin([{
      from: appPath + libsPath,
      to: libsDirName,
    }]),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          beautify: false,
          mangle: true,
          warnings: false,
          compress: true,
          ie8: true,
          comments: false,
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  output: {
    path: bundlePath,
    filename: 'script.js',
    publicPath: '/',
  },
  mode: process.env.NODE_ENV,
  target: 'web',
};

if (isDevMode) {
  // DEVELOPMENT MODE ...
  config.module.rules.push({
    test: /\.jsx?$/,
    enforce: 'pre',
    loader: 'eslint-loader',
    exclude: nodeModulesPath,
  });

  config.entry.push('webpack-hot-middleware/client?path=/__hmr&reload=true');

  Array.prototype.push.apply(config.plugins, [
    new DuplicatePackageCheckerPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ]);
} else {
  // PRODUCTION MODE ...
  config.devtool = false;
  config.watch = false;
}

module.exports = config;
