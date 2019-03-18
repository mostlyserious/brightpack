const path = require('path');
const cache = require('cache-loader/package.json');
const requireOptional = require('../util/require-optional');
const vue = requireOptional('vue') || { version: 0 };

module.exports = config => ({
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-loader',
            options: global.inProduction ? {
                cacheDirectory: path.resolve('.cache/vue'),
                cacheIdentifier: `cache-loader:${cache.version} vue:${vue.version} ${process.env.NODE_ENV}`
            } : {}
        }
    ]
});
