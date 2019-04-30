const path = require('path');
const babel = require('@babel/core');
const browserslist = require('browserslist');
const loader = require('babel-loader/package.json');
const json = JSON.stringify;

module.exports = {
    test: /\.([mc]?[tj]sx?|svelte|svlt)$/,
    exclude: /node_modules\/(?!svelte|vue|bootstrap)/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                cacheDirectory: path.resolve('.cache/js'),
                cacheIdentifier: babel.version + loader.version + json(babel.loadOptions()) + json(browserslist())
            }
        }
    ]
};
