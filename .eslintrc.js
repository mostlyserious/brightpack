const path = require('path');

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
        path.resolve(__dirname, 'eslintrc.json')
    ]
};
