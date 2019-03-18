const css = require('./css');

module.exports = config => {
    const use = css(config).use;
    const sass = require('../sass.config')(config);

    return {
        test: /\.s[ac]ss$/,
        exclude: /editor\.s[ac]ss$/,
        use: [
            ...use,
            {
                loader: 'sass-loader',
                options: {
                    ...sass,
                    sourceMap: false,
                    implementation: require(config.sass)
                }
            }
        ]
    };
};
