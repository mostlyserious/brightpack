const path = require('path');

module.exports = {
    test: /\.([tj]sx?|svelte|svlt)$/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                cacheDirectory: path.resolve('.cache/js')
            }
        }
    ]
};
