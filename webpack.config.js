const path = require('path');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackMd5Hash = require('webpack-md5-hash');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: "development",
    entry: {main: './src/js/index.js'},
    devServer: {

        // Can be omitted unless you are using 'docker'
        host: '0.0.0.0',

        // This is where webpack-dev-server serves your bundle
        // which is created in memory.
        // To use the in-memory bundle,
        // your <script> 'src' should point to the bundle
        // prefixed with the 'publicPath', e.g.:
        //   <script src='http://localhost:9001/assets/bundle.js'>
        //   </script>
        publicPath: '/',

        // The local filesystem directory where static html files
        // should be placed.
        // Put your main static html page containing the <script> tag
        // here to enjoy 'live-reloading'
        // E.g., if 'contentBase' is '../views', you can
        // put 'index.html' in '../views/main/index.html', and
        // it will be available at the url:
        //   https://localhost:9001/main/index.html
        contentBase: path.resolve(__dirname, "../views"),

        // 'Live-reloading' happens when you make changes to code
        // dependency pointed to by 'entry' parameter explained earlier.
        // To make live-reloading happen even when changes are made
        // to the static html pages in 'contentBase', add
        // 'watchContentBase'
        watchContentBase: true,

        compress: true,
        port: 9001
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js'
    },
    module: {
        //We might not need to use babel for now. Comment to do it
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.scss$/,
                use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            }
        ]
    },

    devtool: "source-map",
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style.css',
        }),
        new HtmlWebpackPlugin({
            inject: false,
            hash: true,
            template: './src/index.html',
            filename: 'index.html'
        }),
        new WebpackMd5Hash(),
        new CopyWebpackPlugin([
            {from: 'src/img', to: 'img'},
            {from: 'src/assets', to: 'assets'}
        ]),
    ]
};
