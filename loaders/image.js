module.exports = {
    test: /\.(png|jpe?g|gif|svgz?)$/,
    exclude: /\/(favicon|font)s?\//,
    type: 'asset/resource',
    generator: {
        filename: global.inProduction
            ? `img/${global.args.filename}[ext]`
            : 'img/[name][ext]'
    }
};
