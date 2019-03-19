const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const plugins = require('../postcss.plugins');

module.exports = {
    test: /\.css$/,
    exclude: /editor\.css$/,
    use: [
        global.inProduction ? MiniCssExtractPlugin.loader : {
            loader: 'vue-style-loader'
        },
        {
            loader: 'css-loader',
            options: {
                sourceMap: false
            }
        },
        plugins.length ? {
            loader: 'postcss-loader',
            options: {
                plugins, sourceMap: false
            }
        } : null
    ].filter(Boolean)
};
