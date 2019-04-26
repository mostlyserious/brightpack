const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    test: /\.(post)?css$/,
    exclude: /editor\.css$/,
    use: [
        global.inProduction ? MiniCssExtractPlugin.loader : {
            loader: 'vue-style-loader'
        },
        // {
        //     loader: 'style-loader'
        // },
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
