const path = require('path')

module.exports = {
  entry: 'app.js',
  output: {
    filename: './public/bundle.js'
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'source/js')],
    alias: {
      vue: 'vue/dist/vue.js'
    }
  },
  node: {
    fs: 'empty'
  }
}
