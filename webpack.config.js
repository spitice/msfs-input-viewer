
//@ts-check
"use strict";

const path = require("path");

const FileManagerPlugin     = require("filemanager-webpack-plugin");
const MiniCssExtractPlugin  = require("mini-css-extract-plugin");
const PnpPlugin             = require("pnp-webpack-plugin");
const TerserPlugin          = require("terser-webpack-plugin");

const packageName = "spitice-ingamepanels-inputviewer";

// Mitigating the type error
/** @type {any} */
const terserPlugin = new TerserPlugin({
    terserOptions: {
        mangle: false,
        output: {
            beautify: true,
        },
    },
});

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
                        // "sourceMap": true,
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

    optimization: {
        minimize: true,
        minimizer: [
            terserPlugin,
        ],
    },

    output: {
        filename: "[name].js",
        path: path.resolve( __dirname, "dist" ),
    },
};

module.exports = webpackConfig;
