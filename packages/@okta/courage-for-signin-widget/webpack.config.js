/* global module __dirname */
const path = require('path');
const packageJson = require('./package.json');
const SHARED_JS = path.resolve(__dirname, 'node_modules/@okta/courage/src');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { BannerPlugin, IgnorePlugin } = require('webpack');
const DIST_FILE_NAME = 'courage-for-signin-widget';

const EXTERNAL_PATHS = [
  'qtip',
  'handlebars',
  'okta-i18n-bundles'
];

const webpackConfig = {
  entry: ['./src/CourageForSigninWidget.js'],
  devtool: 'source-map',
  output: {
    // why the destination is outside current directory?
    // turns out node_modules in current directory will hoist
    // node_modules at root directory.
    path: path.resolve(__dirname, '../'),
    filename: `${DIST_FILE_NAME}.js`,
    libraryTarget: 'commonjs2'
  },
  externals: EXTERNAL_PATHS,
  resolve: {
    alias: {

      // Backbone depends on underscore >= 1.8.3 which resolves to 1.9.1
      // Courage depends on underscore 1.8.3
      // Therefore two underscore has been bundled unless set the followin alias
      'underscore': `${SHARED_JS}/vendor/lib/underscore`,

      'vendor': `${SHARED_JS}/vendor`,
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: function(filePath) {
          return filePath.indexOf('courage/src') === -1 || filePath.indexOf('courage/src/vendor') > 0
        },
        loader: 'babel-loader',
        query: {
          presets: ['env'],
        }
      },
    ]
  },

  plugins: [
    new IgnorePlugin(/^\.\/locale$/, /moment$/),
    // simplemodal is from dependency chain and it's not used at all in sign-in widget
    //   BaseRouter -> ConfirmationDialog -> BaseFormDialog -> BaseModalDialog -> simplemodal
    new IgnorePlugin(/vendor\/plugins\/jquery\.simplemodal/, /courage/),
    new BannerPlugin(`THIS FILE IS GENERATED FROM PACKAGE @okta/courage@${packageJson.dependencies['@okta/courage']}`),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      reportFilename: `${DIST_FILE_NAME}.html`,
      analyzerMode: 'static',
    })
  ]

};

module.exports = webpackConfig;
