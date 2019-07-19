const NAME = 'remove-empty-entries';

module.exports = class RemoveEmptyEntriesPlugin {
    constructor(options) {
        this.apply = this.apply.bind(this);
        this.options = Object.assign({}, {
            test: [
                /less\//,
                /s?[ac]ss\//,
                /img\//,
                /favicons?\//,
                /fonts?\//,
                /media\//
            ]
        }, options);
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(NAME, compilation => {
            compilation.hooks.chunkAsset.tap(NAME, (chunk, file) => {
                if (chunk.hasEntryModule()) {
                    let resources;

                    if (typeof chunk.entryModule.resource === 'string') {
                        resources = [ chunk.entryModule.resource ];
                    } else if (chunk.entryModule.dependencies && chunk.entryModule.dependencies.length) {
                        const modulesWithResources = chunk.entryModule.dependencies
                            .map(dep => dep.module)
                            .filter(m => m && (m.resource || m.rootModule));

                        resources = modulesWithResources.map(m => (m.resource || m.rootModule.resource));
                    }

                    if (resources) {
                        if (resources.length && resources.every(resource => this.options.test.find(ext => ext.test(resource)))) {
                            if (file.endsWith('.js')) {
                                chunk.files = chunk.files.filter(f => f !== file);
                                delete compilation.assets[file];
                            }
                        }
                    }
                }
            });
        });
    }
};
