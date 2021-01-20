const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const EnvironmentPlugin = webpack.EnvironmentPlugin;

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({title: "Ross RPG",
                           template: 'src/index.html'
                          }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new EnvironmentPlugin({
      API_ROOT: 'http://localhost:4000/',
      WS_URL: 'ws://localhost:4000/',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  entry: {
    bundle: './src/index.tsx',
  },
  mode: "development",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        loader: 'file-loader',
      },      
      {
        test: /\.svg$/,
        loader: 'file-loader'
      },
      {
        test: /\.png$/,
        loader: 'file-loader'
      },      
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: 'style-loader'
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader'
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "postcss-preset-env",
                    "autoprefixer",
                    {
                      // Options
                    },
                  ],
                ],
              },            
            }
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader'
          }
        ]
      }      
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    fallback: { "path": require.resolve("path-browserify"),
                "zlib": require.resolve("browserify-zlib"),
                "util": require.resolve("util/"),
                "assert": require.resolve("assert/"),
                "stream": require.resolve("stream-browserify")
              },
  },
  output: {
    filename: '[name].js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist')
  }
};
