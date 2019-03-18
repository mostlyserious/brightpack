module.exports = config => ({
    test: /\.(png|xml|ico|svg|webmanifest)$/,
    include: /\/favicons?\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: global.inProduction ? `${config.filename}.[ext]` : '[name].[ext]',
                outputPath: 'favicon/'
            }
        }
    ]
});
