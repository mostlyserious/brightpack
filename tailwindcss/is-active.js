const plugin = require('tailwindcss/plugin');

module.exports = plugin(({ addVariant, e }) => {
    addVariant('is-active', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
            return `
                .is-active .${e(`active${separator}${className}`)},
                .${e(`active${separator}${className}`)}.is-active
            `;
        });
    });
});
