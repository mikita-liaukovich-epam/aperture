const path = require('path');

module.exports = {
  resolve: {
    alias: {
      images: path.resolve(__dirname, 'src/images/'),
      utils: path.resolve(__dirname, 'src/utils'),
    }
  }
}