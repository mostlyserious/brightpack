const path = require('path');
const cache = require('cache-loader/package.json');
const requireOptional = require('../lib/require-optional');
const vue = requireOptional('vue') || { version: 0 };

module.exports = {
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-loader',
            options: {
                cacheDirectory: path.resolve('.cache/vue'),
                cacheIdentifier: `cache-loader:${cache.version} vue:${vue.version}`
            }
        }
    ]
};
