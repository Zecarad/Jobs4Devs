const path = require("path");
const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    mode: 'development', // Cambia a 'production' para producción
    entry: './public/js/app.js',
    target: 'web',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, "./public/dist"),
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    resolve: {
        alias: {
            process: 'process/browser',
        },
        fullySpecified: false,
        fallback: {
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            path: require.resolve('path-browserify'),
            util: require.resolve('util/'),
            "os": require.resolve("os-browserify/browser"),
            fs: false,
            vm: require.resolve("vm-browserify"),
            crypto: require.resolve('crypto-browserify'),
            http: require.resolve('stream-http'),
            https: require.resolve("https-browserify"),
            zlib: require.resolve("browserify-zlib"),
            events: require.resolve("events/"),
            path: require.resolve("path-browserify"),
            net: false,
            dns: false,
            child_process: false,
            constants: require.resolve('constants-browserify'),
            tls: require.resolve('tls-browserify'),
        },
    },
    plugins: [
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ],
    optimization: {
        minimize: true, // Habilita la minimización en producción
        },
    stats: {
        errorDetails: true,
    },
};
