const path = require('path')
const webpack = require('webpack')
const DotenvPlugin = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry:  './src/main.js',
  // entry: './src/index.js',
  output: {
    filename:   'bundle.js',
    path:       path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    contentBase:        path.join(__dirname, 'dist'),
    compress:           true,
    port:               3003,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test:    /\.jsx?$/,
        exclude: /node_modules/,
        use:     { loader: 'babel-loader' },
      },
      {
        test: /\.css$/i,
        use:  [ 'style-loader', 'css-loader' ],
      },
      // {
      //   test: /\.(s*)css$/,
      //   use: ExtractTextPlugin.extract({
      //     fallback: 'style-loader',
      //     use: ['css-loader', 'sass-loader'],
      //   }),
      // },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use:  [
          {
            loader:  'url-loader',
            options: {
              limit: 8000, // Convert images < 8kb to base64 strings
              name:  'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new DotenvPlugin(),
    new webpack.ProvidePlugin({
      $:      'jquery',
      jQuery: 'jquery',
    }),
    new HtmlWebpackPlugin({ template: `${__dirname}/src/index.html` }),
  ],
  watchOptions: { poll: 500 },
  mode:         'development',
}
