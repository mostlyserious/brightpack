module.exports = {
    test: /\.(html|txt)$/,
    exclude: /\.(svelte|svlt)\.html$/,
    use: [ 'raw-loader' ]
};
