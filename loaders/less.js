const css = require('./css');

module.exports = config => {
    const use = css(config).use;

    return {
        test: /\.less$/,
        exclude: /editor\.less$/,
        use: [
            ...use,
            {
                loader: 'less-loader',
                options: { sourceMap: false }
            }
        ]
    };
};
