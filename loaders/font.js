module.exports = config => ({
    test: /\.(woff2?|svgz?|eot|otf|ttf)$/,
    include: /\/fonts?\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: global.inProduction ? `${config.filename}.[ext]` : '[name].[ext]',
                outputPath: 'font/'
            }
        }
    ]
});
