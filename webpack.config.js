const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({title: "Ross RPG",
                           template: 'src/index.html'
                          }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
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
    fallback: { "path": require.resolve("path-browserify") },
  },
  output: {
    filename: '[name].js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist')
  }
};
