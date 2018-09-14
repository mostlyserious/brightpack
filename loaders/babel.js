const path = require('path');

module.exports = {
    test: /\.([tj]sx?|svelte|svlt|vue)$/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                cacheDirectory: path.resolve('.cache/js')
            }
        }
    ]
};
