module.exports = function(config, modules, loaders) {
    modules = [].concat(modules);
    loaders = [].concat(loaders);

    config.module.rules = config.module.rules.map(rule => {

        if (rule.use.filter(use => loaders.includes(use.loader)).length) {
            if (rule.exclude) {
                rule.exclude = rule.exclude.toString();
                rule.exclude = rule.exclude.replace(/^\/|\/$/g, '');
                rule.exclude = rule.exclude.replace(/^\(|\)$/g, '');
                modules.push(rule.exclude);
            }

            rule.exclude = new RegExp(`${modules.join('|')}`);
        }

        return rule;
    });
};
