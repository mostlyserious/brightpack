const path = require('path');
const requireOptional = require('../lib/require-optional');
const vue = requireOptional('vue') || { version: 0 };

module.exports = {
    test: /\.vue$/,
    use: [
        {
            loader: 'vue-loader',
            options: {
                cacheDirectory: path.resolve('.cache/vue'),
                cacheIdentifier: `vue:${vue.version}`
            }
        }
    ]
};
