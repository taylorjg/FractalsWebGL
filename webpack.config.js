/* eslint-env node */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");

const path = require("path");
const packageJson = require("./package.json");

const buildFolder = path.join(__dirname, "build");

module.exports = {
  mode: "production",
  entry: {
    bundle: "./src/js/index.js",
  },
  output: {
    path: buildFolder,
    filename: "[name].js",
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { context: "./src", from: "*.css" },
        { context: "./src", from: "*.png" },
        { context: "./src", from: "manifest.json" },
      ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      version: packageJson.version,
    }),
    // Replace "self.__WB_MANIFEST" in ./src/service-worker.js with an array
    // containing details of the files outputted by this webpack build e.g.
    // [{
    //   'revision': 'c6ff9533527fa1cc4c1391cb4f58f01e',
    //   'url': 'bundle.js'
    // }, {
    //   'revision': 'cb51ec3631dadfa62ae2147af8ee14ed',
    //   'url': 'icon.png'
    // }, {
    //   'revision': 'e1141138f5eb3e1aa5f35134ef3e1abe',
    //   'url': 'index.html'
    // }, {
    //   'revision': 'ad0ac99e22f1a4d5ee978d053e375e5b',
    //   'url': 'manifest.json'
    // }, {
    //   'revision': '8603b34c183d42c091042bf787ad11c5',
    //   'url': 'src_js_web-worker_js.js'
    // }, {
    //   'revision': 'd391616d1f8c5a980e0045e395b32a57',
    //   'url': 'styles.css'
    // }]
    new InjectManifest({
      swSrc: "./src/service-worker.js",
    }),
  ],
  module: {
    rules: [
      // https://stackoverflow.com/a/71366536
      // https://webpack.js.org/guides/asset-modules/#source-assets
      {
        test: /\.glsl$/,
        type: "asset/source",
      },
    ],
  },
  devtool: "source-map",
  devServer: {
    static: buildFolder,
  },
};
