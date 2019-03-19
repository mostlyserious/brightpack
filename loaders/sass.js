const sass = require('../sass.config');
const css = require('./css');
const use = [...css.use];

module.exports = {
    test: /\.s[ac]ss$/,
    exclude: /editor\.s[ac]ss$/,
    use: [
        ...use,
        {
            loader: 'sass-loader',
            options: {
                ...sass,
                sourceMap: false
            }
        }
    ]
};
