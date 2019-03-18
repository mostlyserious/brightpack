module.exports = config => ({
    test: /\.(png|jpe?g|gif|svgz?)$/,
    exclude: /\/(favicon|font)s?\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: global.inProduction ? `${config.filename}.[ext]` : '[name].[ext]',
                outputPath: 'img/'
            }
        }
    ]
});
