let { resolve, join } = require('path');

module.exports = {
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
