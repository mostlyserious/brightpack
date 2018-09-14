module.exports = {
    test: /\.(png|xml|ico|svg|webmanifest)$/,
    include: /\/favicons?\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'favicon/'
            }
        }
    ]
};
