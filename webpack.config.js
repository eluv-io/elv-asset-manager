const webpack = require("webpack");
const Path = require("path");
const autoprefixer = require("autoprefixer");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");

module.exports = {
  entry: "./src/index.js",
  target: "web",
  output: {
    path: Path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
    filename: "index.js",
    chunkFilename: "bundle.[id].[chunkhash].js"
  },
  devServer: {
    hot: true,
    client: {
      //webSocketURL: "auto://elv-test.io/ws",
      overlay: false
    },
    historyApiFallback: true,
    allowedHosts: "all",
    port: 8084,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "POST"
    },
    // This is to allow configuration.js to be accessed
    static: {
      directory: Path.resolve(__dirname, "./config"),
      publicPath: "/"
    }
  },
  mode: "development",
  devtool: "eval-source-map",
  externals: {
    crypto: "crypto"
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: Path.join(__dirname, "configuration.js"),
      to: Path.join(__dirname, "dist", "configuration.js")
    }]),
    new HtmlWebpackPlugin({
      title: "Eluvio Video Asset Manager",
      template: Path.join(__dirname, "src", "index.html"),
      filename: "index.html",
      favicon: "node_modules/elv-components-js/src/icons/favicon.png",
      inject: "body"
    })
  ],
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              modules: {
                mode: "local",
                auto: true
              }
            }
          },
          { loader: "postcss-loader" },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                silenceDeprecations: ["legacy-js-api", "import"]
              }
            }
          }
        ]
      },
      {
        test: /\.(js|mjs)$/,
        exclude: /node_modules\/(?!elv-components-js)/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react", "babel-preset-mobx"]
        }
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader"
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader"
          },
        ],
      },
      {
        test: /\.(txt|bin|abi)$/i,
        loader: "raw-loader"
      }
    ]
  }
};

