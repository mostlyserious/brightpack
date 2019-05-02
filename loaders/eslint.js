const path = require('path');
const chalk = require('chalk');

module.exports = {
    enforce: 'pre',
    test: /\.([mc]?[tj]sx?|svelte|svlt|vue)$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'eslint-loader',
            options: {
                cache: path.resolve('.cache/eslint'),
                formatter(results) {
                    return results.map((file, i) => {
                        const basename = path.basename(file.filePath);

                        return file.messages.map(({ ruleId, message, line, column }, n) => [
                            chalk.reset.magenta(`${n + 1}. ${basename}:${line}:${column}`),
                            chalk.dim.blue(`${ruleId ? `${ruleId}: ` : ''}${message}`)
                        ].join(`\n`)).join(`\n`);
                    });
                }
            }
        }
    ]
};
