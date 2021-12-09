const { cloneDeep } = require('lodash');

module.exports = function(config, loader, handler) {

    config.module.rules = cloneDeep(config.module.rules.map(rule => {
        if (rule.use) {
            rule.use = cloneDeep(rule.use.map(use => {
                if (loader === use.loader) {
                    handler(use, rule);
                }

                return use;
            }));
        }

        return rule;
    }));
};
