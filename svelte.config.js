const path = require('path');
const sass = require('node-sass');
const postcss = require('postcss');
const sassOptions = require('./sass.config');
const postcssload = require('postcss-load-config');
const postcssrc = postcssload(process.cwd());
const requireOptional = require('./lib/require-optional');

let { preprocess, ...svelteOptions } = requireOptional(path.join(process.cwd(), 'svelte.config.js')) || {};

preprocess = preprocess || {};

module.exports = {
    emitCss: true,
    dev: !global.inProduction,
    ...svelteOptions,
    preprocess: {
        ...preprocess,

        markup(input) {
            input = preprocess.markup ? preprocess.markup(input) : input;

            return {
                code: (input.code || input.content).replace(/>[\n\r\t\s]+</gm, '> <'),
                dependencies: input.dependencies || []
            };
        },
        async style(input) {
            input = preprocess.style ? preprocess.style(input) : input;

            if (!input.attributes.type || [ 'text/postcss', 'text/css' ].includes(input.attributes.type)) {
                const { plugins } = await postcssrc;
                const result = await postcss(plugins).process((input.code || input.content), {
                    from: 'src',
                    map: { inline: false }
                });

                return {
                    code: result.css,
                    map: result.map
                };
            } else if (input.attributes.type === 'text/scss') {
                const result = await sass.render({
                    ...sassOptions,
                    data: (input.code || input.content),
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
};
