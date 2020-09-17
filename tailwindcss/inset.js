const plugin = require('tailwindcss/plugin');

module.exports = plugin(({ addUtilities, variants }) => {
    const utilities = {
        '.inset-center': {
            'top': '50%',
            'left': '50%',
            '--transform-translate-x': '-50%',
            '--transform-translate-y': '-50%'
        },
        '.inset-x-center': {
            'left': '50%',
            '--transform-translate-x': '-50%'
        },
        '.inset-y-center': {
            'top': '50%',
            '--transform-translate-y': '-50%'
        }
    };

    addUtilities(utilities, variants('inset'));
});
