const fs = require('fs');
const path = require('path');
const autoprefixer = require('autoprefixer');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const requireOptional = require('./lib/require-optional');
const postcssColorFunction = require('postcss-color-function');
const tailwindConfig = path.resolve(process.cwd(), 'tailwind.config.js');
const tailwindcss = requireOptional('tailwindcss');

module.exports = [
    postcssImport(),
    tailwindcss && fs.existsSync(tailwindConfig)
        ? tailwindcss(tailwindConfig)
        : null,
    global.inProduction ? autoprefixer({
        flexbox: 'no-2009',
        grid: true
    }) : null,
    postcssNested(),
    postcssColorFunction()
].filter(Boolean);
