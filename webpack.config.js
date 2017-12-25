const path = require('path');
const webpack = require('webpack');


const plugins = [
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),
  
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    },
  }),
];



module.exports = {
  context: path.join(__dirname, 'src/parsers'),
  entry: './index',
  output: {
    filename: 'bioparsers.min.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'bio-parsers'
  },
  module: {
      loaders: [
        { test: /\.js$/,
          loader: 'babel-loader',
          exclude: path.join(__dirname, 'node_modules'),
          query: {
            presets: [ 'es2015', 'stage-0' ],
          },
        },
      ],
  },
  plugins: plugins,
  target: 'web'
};
