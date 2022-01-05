const path = require('path');
const webpack = require('webpack');

// Need to finish and add build scripts
module.exports = {
  target: 'node',
  entry: [
    'react-hot-loader/patch',
    'webpack/hot/only-dev-server',
    './server/index.js'
  ],
  output: {
    filename: 'bundle.js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/',
    path: path.resolve(__dirname, '../build/server')
  },
  externals: (context, request, callback) => {
    // Externalize all npm modules.
    if (/^[a-z0-9-][a-z0-9-./]+$/.test(request)) {
      return callback(null, `commonjs ${request}`);
    }
    callback();
  },
  devServer: {
    hot: true,
    inline: true,
    port: 3000
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        use: 'url-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(graphql|gql)$/,
        use: 'graphql-tag/loader',
        exclude: /node_modules/
      }
    ],
  },
  resolve: {
    extensions: [' ', '.js']
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};
