/* eslint-env node */

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkerPlugin = require('worker-plugin')

const path = require('path')
const { version } = require('./package.json')

const serverPublic = path.join(__dirname, 'server', 'public')

module.exports = {
  mode: 'production',
  entry: './src/js/index.js',
  output: {
    path: serverPublic,
    filename: 'bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { context: './src', from: '*.html' },
        { context: './src', from: '*.css' },
        { context: './src', from: '*.png' },
        { context: './src', from: 'manifest.json' },
        { context: './src', from: 'service-worker.js' },
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      version
    }),
    new WorkerPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'webpack-glsl-loader'
      }
    ]
  },
  devtool: 'source-map',
  devServer: {
    contentBase: serverPublic
  }
}
