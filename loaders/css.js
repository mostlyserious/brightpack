const fs = require('fs');
const path = require('path');
const autoprefixer = require('autoprefixer');
const postcssimport = require('postcss-import');
const requireOptional = require('../util/require-optional');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const tailwindConfig = path.resolve(process.cwd(), 'tailwind.js');
const tailwindcss = requireOptional('tailwindcss');

const plugins = [
    postcssimport(),
    tailwindcss && fs.existsSync(tailwindConfig)
        ? tailwindcss(tailwindConfig)
        : null,
    global.inProduction ? autoprefixer({
        flexbox: 'no-2009',
        grid: true
    }) : null
].filter(Boolean);

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
