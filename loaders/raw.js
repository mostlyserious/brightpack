module.exports = config => ({
    test: /\.(html|txt)$/,
    exclude: /\.(svelte|svlt)\.html$/,
    use: ['raw-loader']
});
