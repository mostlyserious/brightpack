module.exports = config => ({
    test: /\.(svg)$/,
    exclude: /\/(favicon|font)s?\//,
    use: ['svgo-loader']
});
