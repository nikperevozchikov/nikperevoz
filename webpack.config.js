const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, './'),
        filename: "index.js"
    },
    module: {
        rules: [
            {
                test: /\.(sass|scss)$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "sass-loader" // compiles Sass to CSS
                }]
            }
        ]
    },

    resolve: {
        alias: {
            "vue$": "vue/dist/vue.esm.js"
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "index.css"
        })

    ],
    devServer: {  // configuration for webpack-dev-server
       // contentBase: './src/test',  //source of static assets
        port: 8700, // port to run dev-server
    }

};