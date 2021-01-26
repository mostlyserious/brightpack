const plugin = require('tailwindcss/plugin');

module.exports = plugin(({ addUtilities, variants }) => {
    const utilities = {
        '.filter': {
            '--tw-blur': '0',
            '--tw-brightness': '1',
            '--tw-contrast': '100%',
            '--tw-grayscale': '0',
            '--tw-hue-rotate': '0',
            '--tw-invert': '0',
            '--tw-saturate': '100%',
            '--tw-sepia': '0',
            'filter': [
                'blur(var(--tw-blur))',
                'brightness(var(--tw-brightness))',
                'contrast(var(--tw-contrast))',
                'grayscale(var(--tw-grayscale))',
                'hue-rotate(var(--tw-hue-rotate))',
                'invert(var(--tw-invert))',
                'saturate(var(--tw-saturate))',
                'sepia(var(--tw-sepia))'
            ].join(' ')
        }
    };

    const tenToHundred = {
        '10': '10%',
        '20': '20%',
        '30': '30%',
        '40': '40%',
        '50': '50%',
        '60': '60%',
        '70': '70%',
        '80': '80%',
        '90': '90%',
        '100': '100%'
    };

    const tenToTwoHundred = {
        ...tenToHundred,
        '110': '110%',
        '120': '120%',
        '130': '130%',
        '140': '140%',
        '150': '150%',
        '160': '160%',
        '170': '170%',
        '180': '180%',
        '190': '190%',
        '200': '200%'
    };

    const values = {
        blur: {
            '0': '0',
            'px': '1px',
            '1': '0.25rem',
            '2': '0.5rem',
            '3': '0.75rem',
            '4': '1rem'
        },
        brightness: {
            '0': '0',
            '10': '0.1',
            '20': '0.2',
            '30': '0.3',
            '40': '0.4',
            '50': '0.5',
            '60': '0.6',
            '70': '0.7',
            '80': '0.8',
            '90': '0.9',
            '100': '1',
            '110': '1.1',
            '120': '1.2',
            '130': '1.3',
            '140': '1.4',
            '150': '1.5',
            '160': '1.6',
            '170': '1.7',
            '180': '1.8',
            '190': '1.9',
            '200': '2'
        },
        contrast: {
            '0': '0%',
            ...tenToTwoHundred
        },
        grayscale: {
            '0': '0%',
            ...tenToHundred
        },
        hue: {
            '0': '0deg',
            '10': '10deg',
            '20': '20deg',
            '30': '30deg',
            '40': '40deg',
            '50': '50deg',
            '60': '60deg',
            '70': '70deg',
            '80': '80deg',
            '90': '90deg',
            '100': '100deg',
            '110': '110deg',
            '120': '120deg',
            '130': '130deg',
            '140': '140deg',
            '150': '150deg',
            '160': '160deg',
            '170': '170deg',
            '180': '180deg',
            '190': '190deg',
            '200': '200deg',
            '210': '210deg',
            '220': '220deg',
            '230': '230deg',
            '240': '240deg',
            '250': '250deg',
            '260': '260deg',
            '270': '270deg',
            '280': '280deg',
            '290': '290deg',
            '300': '300deg',
            '310': '310deg',
            '320': '320deg',
            '330': '330deg',
            '340': '340deg',
            '350': '350deg'
        },
        invert: {
            '0': '0%',
            ...tenToHundred
        },
        saturate: {
            '0': '0%',
            ...tenToTwoHundred
        },
        sepia: {
            '0': '0%',
            ...tenToHundred
        }
    };

    for (const filter of Object.keys(values)) {
        const options = values[filter];

        for (const key of Object.keys(options)) {
            const value = options[key];

            utilities[`.${filter}-${key}`] = {
                [`--tw-${filter}`]: value
            };
        }
    }

    addUtilities(utilities, variants('filter'));
});
