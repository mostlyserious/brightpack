module.exports = function(config, loader, handler) {

    config.module.rules = config.module.rules.map(rule => {
        rule.use = rule.use.map(use => {
            if (loader === use.loader) {
                handler(use, rule);
            }

            return use;
        });

        return rule;
    });
};
