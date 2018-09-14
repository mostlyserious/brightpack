const sass = require('node-sass');
const config = require('../sass.config');

module.exports = {
    test: /\.(svelte|svlt)$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'svelte-loader',
            options: {
                dev: !global.inProduction,
                hotReload: !global.inProduction,
                store: true,
                preprocess: {
                    style({ content, attributes }) {
                        if (attributes.type === 'text/scss') {
                            let result = sass.renderSync({ ...config, data: content, sourceMap: false });

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
