// const favicon = require('../lib/real-favicon-loader');

module.exports = {
    test: /\.(png|xml|ico|svg|webmanifest)$/,
    include: /\/favicons?\//,
    use: [
        {
            loader: 'file-loader',
            options: {
                outputPath: 'favicon/'
            }
        }
    ]
};
