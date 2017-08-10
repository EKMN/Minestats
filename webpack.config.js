var path = require('path');

module.exports = {
  entry: './app/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'app'),
    library: 'app',
    libraryTarget: 'var'
  }
};
