module.exports = function moduleExists(moduleName) {
    try {
        require.resolve(moduleName);

        return true;
    } catch (e) {
        return false;
    }
};
