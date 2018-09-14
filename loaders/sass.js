const css = require('./css');
const config = require('../sass.config');

module.exports = {
    test: /\.s[ac]ss$/,
    exclude: /editor\.scss$/,
    use: [
        ...css.use,
        {
            loader: 'sass-loader',
            options: { ...config, sourceMap: false }
        }
    ]
};
