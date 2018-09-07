module.exports = {
    test: /\/media\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'media/'
            }
        }
    ]
};
