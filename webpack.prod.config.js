
//@ts-check
"use strict";

const TerserPlugin = require("terser-webpack-plugin");

const baseConfig = require("./webpack.config");

// Mitigating the type error
/** @type {any} */
const terserPlugin = new TerserPlugin({
    extractComments: false,  // Avoid ".js.LICENSE.txt" to be generated
    terserOptions: {
        mangle: false,
        output: {
            // beautify: true,
        },
    },
});

/** @type {import("webpack").Configuration} */
const webpackConfig = {
    ...baseConfig,

    mode: "production",

    optimization: {
        minimize: true,
        minimizer: [
            terserPlugin,
        ],
    },
};

module.exports = webpackConfig;
