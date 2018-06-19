"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = {
    mode: "production",
    target: "node",
    entry: {
        index: ["./src/index.ts"],
    },
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "dist"),
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    },
    module: {
        rules: [{ test: /\.tsx?$/, loader: "ts-loader" }],
    },
    plugins: [],
};
