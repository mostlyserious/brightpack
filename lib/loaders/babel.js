const path = require('path');

module.exports = {
    test: /\.[tj]sx?$/,
    exclude: /node_modules\/(?!bootstrap)/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                cacheDirectory: path.resolve('.cache/js')
            }
        }
    ]
};
