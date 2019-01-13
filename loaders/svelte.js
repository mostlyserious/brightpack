const sass = require(global.sass);
const config = require('../sass.config');
const plugins = require('../postcss.plugins');
const postcss = require('postcss');

module.exports = {
    test: /\.(svelte|svlt)(\.html)?$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'svelte-loader',
            options: {
                dev: !global.inProduction,
                hotReload: !global.inProduction,
                emitCss: true,
                store: true,
                preprocess: {
                    async style({ content, attributes }) {
                        if (!attributes.type || attributes.type === 'text/css') {
                            const result = await postcss(plugins).process(content, {
                                from: 'src',
                                map: { inline: false }
                            });

                            return {
                                code: result.css,
                                map: result.map
                            };
                        } else if (attributes.type === 'text/scss') {
                            const result = await sass.render({
                                ...config,
                                data: content,
                                sourceMap: false
                            });

                            return {
                                code: result.css,
                                map: result.map
                            };
                        }

                        return;
                    }
                }
            }
        }
    ]
};
