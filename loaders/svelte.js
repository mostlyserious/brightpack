const svelteOptions = require('../svelte.config');

module.exports = {
    test: /\.(svelte|svlt)(\.html)?$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'svelte-loader',
            options: svelteOptions
        }
    ]
};
