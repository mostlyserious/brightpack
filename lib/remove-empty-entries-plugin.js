const path = require('path');
const NAME = 'RemoveEmptyEntriesPlugin';

module.exports = class RemoveEmptyEntriesPlugin {
    constructor(options) {
        this.apply = this.apply.bind(this);
        this.options = Object.assign({}, {
            test: /\.js$/
        }, options);
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(NAME, (compilation, done) => {
            const purge = [];

            compilation.chunks.forEach(chunk => {
                const files = chunk.files;
                const sources = chunk.entryModule ? chunk.entryModule.dependencies.map(dep => {
                    return path.basename(dep.module.request);
                }) : [];

                if (!files.every(f => this.options.test.test(f)) || sources.some(s => !this.options.test.test(s))) {
                    if (sources.length && sources.every(s => !this.options.test.test(s))) {
                        files.forEach(f => {
                            if (this.options.test.test(f)) {
                                purge.push(f);
                            }
                        });
                    }
                }

                purge.forEach(asset => {
                    delete compilation.assets[asset];
                });
            });

            done();
        });
    }
};
