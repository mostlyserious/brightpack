const css = require('./css');

module.exports = {
    test: /\.less$/,
    exclude: /editor\.less$/,
    use: [
        ...css.use,
        {
            loader: 'less-loader',
            options: { sourceMap: false }
        }
    ]
};
