const fs = require('fs');
const path = require('path');
const __home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const extend = path.resolve(__home, '.eslintrc.json');

module.exports = {
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        ecmaVersion: 8,
        ecmaFeatures: {
            impliedStrict: true
        }
    },
    extends: [
        fs.existsSync(extend) ? extend : null
    ].filter(Boolean),
    plugins: [
        'html'
    ],
    rules: {
        'html/indent': '+4'
    }
};
