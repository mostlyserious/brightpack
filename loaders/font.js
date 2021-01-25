module.exports = {
    test: /\.(woff2?|svgz?|eot|otf|ttf)$/,
    include: /\/fonts?\//,
    type: 'asset/resource',
    generator: {
        filename: global.inProduction
            ? `font/${global.args.filename}[ext]`
            : 'font/[name][ext]'
    }
};
