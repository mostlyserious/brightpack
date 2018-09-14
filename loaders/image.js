module.exports = {
    test: /\.(png|jpe?g|gif|svgz?)$/,
    exclude: /\/(favicon|font)s?\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'img/'
            }
        }
    ]
};
