module.exports = {
    test: /\/media\//,
    type: 'asset/resource',
    generator: {
        filename: global.inProduction
            ? `media/${global.args.filename}[ext]`
            : 'media/[name][ext]'
    }
};
