const path = require('path');
const sass = require('sass');
const sassOptions = require('./sass.config');
const postcssload = require('postcss-load-config');
const postcssrc = postcssload(process.cwd());
const requireOptional = require('./lib/require-optional');

const postcss = requireOptional('postcss');

let { preprocess, ...svelteOptions } = process.cwd() !== __dirname
    ? (requireOptional(path.join(process.cwd(), 'svelte.config.js')) || {})
    : {};

preprocess = preprocess || {};

module.exports = {
    emitCss: false,
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

            if (postcss && (input.attributes.type === 'text/postcss' || input.attributes.lang === 'postcss')) {
                const { plugins } = await postcssrc;
                const result = await postcss(plugins).process((input.code || input.content), {
                    from: 'src',
                    map: { inline: false }
                });

                return {
                    code: result.css,
                    map: result.map
                };
            } else if (input.attributes.type === 'text/scss' || input.attributes.lang === 'scss') {
                const result = sass.compileString((input.code || input.content), sassOptions);

                return {
                    code: result.css.toString(),
                    map: result.map
                };
            }

            return;
        }
    }
};
