const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    test: /\.(post)?css$/,
    use: [
        global.inProduction ? {
            loader: MiniCssExtractPlugin.loader,
            options: {
                esModule: true
            }
        } : {
            loader: 'style-loader'
        },
        {
            loader: 'css-loader',
            options: {
                sourceMap: false
            }
        },
        {
            loader: 'postcss-loader',
            options: {
                sourceMap: false
            }
        }
    ].filter(Boolean)
};
