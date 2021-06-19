
//@ts-check
"use strict";

const TerserPlugin = require("terser-webpack-plugin");

const baseConfig = require("./webpack.config");

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
    ...baseConfig,

    optimization: {
        minimize: true,
        minimizer: [
            terserPlugin,
        ],
    },
};

module.exports = webpackConfig;
