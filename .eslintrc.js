const path = require('path');

module.exports = {
    parser: '@babel/eslint-parser',
    parserOptions: {
        sourceType: 'module',
        requireConfigFile: false,
        allowImportExportEverywhere: true,
        ecmaVersion: 12,
        ecmaFeatures: {
            impliedStrict: true
        }
    },
    extends: [
        path.resolve(__dirname, 'eslintrc.json')
    ]
};
