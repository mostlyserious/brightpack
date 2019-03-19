module.exports = {
    test: /\.(svg)$/,
    exclude: /\/(favicon|font)s?\//,
    use: ['svgo-loader']
};
