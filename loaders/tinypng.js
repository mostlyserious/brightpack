module.exports = config => ({
    test: /\.(png|jpe?g)$/,
    use: ['tinify-loader']
});
