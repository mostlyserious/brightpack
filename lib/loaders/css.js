const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    test: /\.css$/,
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
        global.inProduction ? {
            loader: 'postcss-loader',
            options: {
                sourceMap: false,
                plugins: [
                    autoprefixer({
                        flexbox: 'no-2009',
                        grid: true
                    })
                ]
            }
        } : null
    ].filter(l => l)
};
