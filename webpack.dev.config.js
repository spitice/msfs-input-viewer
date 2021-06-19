
//@ts-check
"use strict";

const baseConfig = require("./webpack.config");

/** @type {import("webpack").Configuration} */
const webpackConfig = {
    ...baseConfig,

    devtool: "cheap-source-map",
};

module.exports = webpackConfig;
