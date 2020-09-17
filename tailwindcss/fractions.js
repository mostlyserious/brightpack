const plugin = require('tailwindcss/plugin');

module.exports = plugin(({ e, addUtilities, variants, theme }) => {
    const bases = {
        'h': [ 'height', 'height' ],
        'min-w': [ 'min-width', 'minWidth' ],
        'max-w': [ 'max-width', 'maxWidth' ],
        'min-h': [ 'min-height', 'minHeight' ],
        'max-h': [ 'max-height', 'maxHeight' ]
    };

    const widths = theme('width');
    const fractions = Object.keys(widths)
        .filter(key => key.includes('/'))
        .reduce((fractions, key) => {
            return (fractions[key] = widths[key], fractions);
        }, {});

    for (const base of Object.keys(bases)) {
        const [ property, variant ] = bases[base];
        const utilities = {};

        for (const key of Object.keys(fractions)) {
            const value = fractions[key];

            utilities[`.${base}-${e(key)}`] = {
                [property]: value
            };
        }

        addUtilities(utilities, variants(variant));
    }
});
