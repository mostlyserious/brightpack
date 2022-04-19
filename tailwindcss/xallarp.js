const plugin = require('tailwindcss/plugin');

module.exports = plugin(({ matchUtilities, addComponents, addUtilities, theme }) => {
    matchUtilities({
        'perspective': value => ({
            '--parallax-perspective': value
        }),
        'parallax-x': value => ({
            'transform': `perspective(var(--parallax-perspective)) translate3d(
                calc(var(--parallax-control) * var(--parallax-x)),
                calc(var(--parallax-control) * var(--parallax-y)),
                calc(var(--parallax-control) * var(--parallax-z))
            )`,
            '--parallax-x': value
        }),
        'parallax-y': value => ({
            'transform': `perspective(var(--parallax-perspective)) translate3d(
                calc(var(--parallax-control) * var(--parallax-x)),
                calc(var(--parallax-control) * var(--parallax-y)),
                calc(var(--parallax-control) * var(--parallax-z))
            )`,
            '--parallax-y': value
        }),
        'parallax-z': value => ({
            'transform': `perspective(var(--parallax-perspective)) translate3d(
                calc(var(--parallax-control) * var(--parallax-x)),
                calc(var(--parallax-control) * var(--parallax-y)),
                calc(var(--parallax-control) * var(--parallax-z))
            )`,
            '--parallax-z': value
        })
    }, {
        values: theme('width')
    });
});
