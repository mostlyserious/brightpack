const sassOptions = require('../sass.config');
const css = require('./css');
const use = [ ...css.use ];

module.exports = {
    test: /\.s[ac]ss$/,
    use: [
        ...use,
        {
            loader: 'sass-loader',
            options: {
                sassOptions,
                sourceMap: true,
                webpackImporter: false
            }
        }
    ]
};
