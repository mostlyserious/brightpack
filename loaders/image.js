module.exports = {
    test: /\.(png|jpe?g|gif|svgz?|webp)$/,
    exclude: /\/(favicon|font)s?\//,
    type: 'asset/resource',
    generator: {
        filename: global.inProduction
            ? `img/${global.args.filename}[ext]`
            : 'img/[name][ext]'
    }
};
