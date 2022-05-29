const css = require('./css');
const use = [ ...css.use ];

module.exports = {
    test: /\.less$/,
    use: [
        ...use,
        {
            loader: 'less-loader',
            options: { sourceMap: true }
        }
    ]
};
