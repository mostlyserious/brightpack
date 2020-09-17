const plugin = require('tailwindcss/plugin');

module.exports = plugin(({ addBase }) => {
    addBase({
        ':root': {
            '--transform-translate-x': '0',
            '--transform-translate-y': '0',
            '--transform-rotate': '0',
            '--transform-skew-x': '0',
            '--transform-skew-y': '0',
            '--transform-scale-x': '1',
            '--transform-scale-y': '1',
            '--filter-blur': '0',
            '--filter-brightness': '1',
            '--filter-contrast': '100%',
            '--filter-grayscale': '0',
            '--filter-hue-rotate': '0',
            '--filter-invert': '0',
            '--filter-saturate': '100%',
            '--filter-sepia': '0',
            '--border-opacity': '1',
            '--text-opacity': '1',
            '--bg-opacity': '1'
        }
    });
});
