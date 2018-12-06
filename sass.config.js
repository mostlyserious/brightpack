const Fiber = require('fibers');
const { resolve, join } = require('path');

module.exports = {
    fiber: global.sass === 'sass' ? Fiber : undefined,
    precision: 3,
    includePaths: [
        resolve('node_modules')
    ],
    importer(file, prev, done) {
        return {
            file: file.replace(/^@(.+)/, (original, filepath) => join('src', filepath))
        };
    }
};
