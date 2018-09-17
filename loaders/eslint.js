const path = require('path');
const chalk = require('chalk');

module.exports = {
    enforce: 'pre',
    test: /\.([tj]sx?|svelte|svlt|vue)$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'eslint-loader',
            options: {
                cache: path.resolve('.cache/eslint'),
                formatter(results) {
                    return results.map((file, i) => {
                        const relativePath = path.relative(process.cwd(), file.filePath);

                        return file.messages.map(({ ruleId, message, line, column }, n) => [
                            chalk.reset.magenta(`${n + 1}. ${relativePath}:${line}:${column}`),
                            chalk.dim.blue(`${ruleId}: ${message}`)
                        ].join(`\n`)).join(`\n`);
                    });
                }
            }
        }
    ]
};
