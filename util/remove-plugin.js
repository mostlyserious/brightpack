module.exports = function(config, plugin) {
    const index = config.plugins.findIndex(({ constructor }) => constructor.name === plugin);

    if (index > -1) {
        config.plugins.splice(index, 1);
    }
};
