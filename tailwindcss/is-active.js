const plugin = require('tailwindcss/plugin');

module.exports = plugin(({ addVariant, e }) => {
    addVariant('is-active', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
            return `
                .is-active .${e(`is-active${separator}${className}`)},
                .${e(`is-active${separator}${className}`)}.is-active
            `;
        });
    });
});
