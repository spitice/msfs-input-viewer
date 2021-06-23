
//@ts-check
"use strict";

const path = require("path");

const FileManagerPlugin     = require("filemanager-webpack-plugin");
const MiniCssExtractPlugin  = require("mini-css-extract-plugin");
const PnpPlugin             = require("pnp-webpack-plugin");

const packageName = "spitice-ingamepanels-inputviewer";

/** @type {import("webpack").Configuration} */
const webpackConfig = {
    mode: "none",

    context: __dirname,
    entry: {
        InputViewer: "./src/InputViewer.ts",
    },

    resolve: {
        extensions: [ ".ts", ".js" ],
        plugins: [ PnpPlugin ],
    },
    resolveLoader: {
        plugins: [
            PnpPlugin.moduleLoader( module ),
        ],
    },

    module: {
        rules: [{
            test: /\.ts$/i,
            exclude: /node_modules/,
            use: [{
                loader: "ts-loader",
                options: {
                    compilerOptions: {
                        "transpileOnly": true,
                        "sourceMap": true,
                        // "declaration": false,
                    },
                },
            }],
        }, {
            test: /\.s[ac]ss$/i,
            use: [
                MiniCssExtractPlugin.loader,
                "css-loader",
                "sass-loader",
            ]
        }]
    },

    plugins: [
        new MiniCssExtractPlugin(),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        {
                            source: "./dist/*",
                            destination: `./Packages/${packageName}/html_ui/InGamePanels/InputViewer`,
                        }
                    ]
                }
            }
        }),
    ],

    output: {
        filename: "[name].js",
        path: path.resolve( __dirname, "dist" ),
    },
};

module.exports = webpackConfig;
