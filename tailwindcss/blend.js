const plugin = require('tailwindcss/plugin');

module.exports = plugin(({ addUtilities, variants }) => {
    const blends = [ 'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity' ];
    const utilities = {};

    for (const blend of blends) {
        const bg = `.bg-${blend}`;
        const mix = `.mix-${blend}`;

        utilities[bg] = {
            'background-blend-mode': blend
        };

        utilities[mix] = {
            'mix-blend-mode': blend
        };
    }

    addUtilities(utilities, variants('backgroundColor'));
});
