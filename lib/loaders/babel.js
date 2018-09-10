const path = require('path');

module.exports = {
    test: /\.[tj]sx?$/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                cacheDirectory: path.resolve('.cache/js')
            }
        }
    ]
};
