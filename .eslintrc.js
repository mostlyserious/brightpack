const path = require('path');
const __home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

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
        path.resolve(__home, '.eslintrc.json')
    ],
    plugins: [
        'html'
    ],
    rules: {
        'html/indent': '+4'
    }
};
