/* eslint-env node */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { InjectManifest } = require("workbox-webpack-plugin");

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
    // containing details of the files output by this webpack build e.g.
    // [
    //   {
    //     'revision': 'c6ff9533527fa1cc4c1391cb4f58f01e',
    //     'url': 'bundle.js'
    //   },
    //   ...
    // ]
    // new InjectManifest({
    //   swSrc: "./src/service-worker.js",
    // }),
  ],
  module: {
    rules: [
      // https://stackoverflow.com/a/71366536
      // https://webpack.js.org/guides/asset-modules/#source-assets
      {
        test: /\.glsl$/,
        type: "asset/source",
      },
      // https://webpack.js.org/loaders/babel-loader/#options
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
            plugins: ["@babel/plugin-proposal-optional-chaining"],
          },
        },
      },
    ],
  },
  devtool: "source-map",
  devServer: {
    static: buildFolder,
  },
};
