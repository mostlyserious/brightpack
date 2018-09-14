const path = require('path');
const cache = require('cache-loader/package.json');
const moduleExists = require('../util/module-exists');
const vue = moduleExists('vue')
    ? require('vue/package.json')
    : { version: 0 };

module.exports = {
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
};
