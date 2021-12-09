const fs = require('fs');
const path = require('path');
const __home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const extend = path.resolve(__home, '.eslintrc.json');

module.exports = {
    parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module',
        allowImportExportEverywhere: true,
        ecmaVersion: 2020,
        ecmaFeatures: {
            impliedStrict: true
        }
    },
    extends: [
        fs.existsSync(extend) ? extend : null
    ].filter(Boolean)
};
