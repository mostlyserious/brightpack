const fs = require('fs');
const path = require('path');
const autoprefixer = require('autoprefixer');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const requireOptional = require('../util/require-optional');
const postcssColorFunction = require('postcss-color-function');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const tailwindConfig = path.resolve(process.cwd(), 'tailwind.js');
const tailwindcss = requireOptional('tailwindcss');

const plugins = [
    postcssImport(),
    tailwindcss && fs.existsSync(tailwindConfig)
        ? tailwindcss(tailwindConfig)
        : null,
    global.inProduction ? autoprefixer({
        flexbox: 'no-2009',
        grid: true
    }) : null,
    postcssNested(),
    postcssColorFunction()
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
