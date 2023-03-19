const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'webpack.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
    ],
  },
};
