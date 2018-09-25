module.exports = {
    test: /\.(woff2?|svgz?|eot|otf|ttf)$/,
    include: /\/fonts?\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'font/'
            }
        }
    ]
};
