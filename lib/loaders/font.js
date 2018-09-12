module.exports = {
    test: /\.(woff2?|svgz?|eot|otf|ttf)$/,
    include: /\/fonts?\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: global.inProduction ? '[name].[hash:7].[ext]' : '[name].[ext]',
                outputPath: 'font/'
            }
        }
    ]
};
