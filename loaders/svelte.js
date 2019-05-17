const sass = require('node-sass');
const postcss = require('postcss');
const postcssload = require('postcss-load-config');
const postcssrc = postcssload(process.cwd());
const sassconfig = require('../sass.config');

module.exports = {
    test: /\.(svelte|svlt)(\.html)?$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'svelte-loader',
            options: {
                dev: !global.inProduction,
                emitCss: true,
                preprocess: {
                    markup({ content }) {
                        return {
                            code: content.replace(/>[\n\r\t\s]+</gm, '> <')
                        };
                    },
                    async style({ content, attributes }) {
                        if (!attributes.type || [ 'text/postcss', 'text/css' ].includes(attributes.type)) {
                            const { plugins } = await postcssrc;
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
                                ...sassconfig,
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
