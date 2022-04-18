const requireOptional = require('../lib/require-optional');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    test: /\.(post)?css$/,
    use: [
        global.inProduction ? {
            loader: MiniCssExtractPlugin.loader
        } : {
            loader: 'style-loader'
        },
        {
            loader: 'css-loader',
            options: {
                sourceMap: true
            }
        },
        requireOptional('postcss-loader') ? {
            loader: 'postcss-loader',
            options: {
                sourceMap: true
            }
        } : null
    ].filter(Boolean)
};
