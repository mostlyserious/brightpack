module.exports = function(config, plugin) {
    config.plugins.splice(config.plugins.findIndex(({ constructor }) => constructor.name === plugin), 1);
};
