const path = require('path');

module.exports = function moduleExists(moduleName) {
    try {
        return require(path.resolve(process.cwd(), 'node_modules', moduleName));
    } catch (e) {
        return false;
    }
};
