module.exports = function moduleExists(moduleName) {
    try {
        return require(moduleName);
    } catch (e) {
        return false;
    }
};
