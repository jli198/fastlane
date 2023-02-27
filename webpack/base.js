const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

/* AW: very simple code that regenerates assets every time run webpack */
/* By putting it in here, it runs BEFORE webpack does */
/* Note that this regenerates each time you run node -- NOT every time it refreshes the browser */
const fs = require('fs');
var assets_path = path.join("public","assets");
var asset_file = path.join(__dirname,"..","public","images.json");
const extensions = [".png",".jpg",".jpeg"];
var assets = [];
var files = fs.readdirSync(assets_path);
files.forEach(file => {
  if(extensions.indexOf(path.extname(file).toLowerCase())>-1) {
    assets.push(file.substr(0,file.length-path.extname(file).length));
  }
});
fs.writeFileSync(asset_file,JSON.stringify(assets));
console.log(asset_file+" written");
/* end AW assets code */


module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: "raw-loader"
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ]
};
