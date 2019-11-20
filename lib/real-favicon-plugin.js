const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');
const rfgApi = require('rfg-api');
const AdmZip = require('adm-zip');
const requireOptional = require('./require-optional');
const HtmlWebpackPlugin = requireOptional('html-webpack-plugin');

const NAME = 'RealFaviconPlugin';
const userhome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const apikeypath = path.join(userhome, '.realfavicon');
const rfg = rfgApi.init();

let apikey;

if (process.env.REALFAVICON_KEY) {
    apikey = process.env.REALFAVICON_KEY;
} else if (fs.existsSync(apikeypath)) {
    apikey = fs.readFileSync(apikeypath, 'utf8').trim();
}

class RealFaviconPlugin {
    constructor(options) {
        const { outputPath } = options;

        if (!outputPath) {
            throw new Error(`${NAME}: Missing outputPath option`);
        }

        options.inject = (!!options.inject && !!HtmlWebpackPlugin);

        this.options = options;
    }

    generateFavicons(next) {
        // const cache = path.resolve('.cache/favicon', hash(this.request));

        // console.log(cache);

        axios.post('https://realfavicongenerator.net/api/favicon', {
            'favicon_generation': this.request
        }).then(res => {
            https.get(res.data.favicon_generation_result.favicon.package_url, res => {
                let data = [],
                    size = 0,
                    pos = 0;

                res.on('data', chunk => {
                    data.push(chunk);
                    size += chunk.length;
                }).on('end', () => {
                    const buffer = Buffer.alloc(size);

                    data.forEach(chunk => {
                        chunk.copy(buffer, pos);
                        pos += chunk.length;
                    });

                    const zip = new AdmZip(buffer);

                    next(null, zip.getEntries());
                });
            });
        }).catch(error => {
            let err = (error
                && error.data
                && error.data.favicon_generation_result
                && error.data.favicon_generation_result.result
                && error.data.favicon_generation_result.result.error_message)
                ? error.data.favicon_generation_result.result.error_message
                : error;

            next(err);
        });
    }

    apply(compiler) {
        // Hook into https://webpack.js.org/api/compiler-hooks#thiscompilation
        compiler.hooks.thisCompilation.tap(NAME, compilation => {
            const buffer = fs.readFileSync(path.resolve('src/divider.svg'));
            // const jsonPath = path.join(compiler.context, this.options.faviconJson);
            // const json = require(jsonPath);
            // const outputPath = this.options.outputPath;

            if (!this.options.apikey) {
                this.options.apikey = apikey;

                if (!this.options.apikey) {
                    throw new Error(`${NAME}: No API key provided for Real Favicon Generator.`);
                }
            }
            // apiKey: this.options.apikey,
            // iconsPath: `${this.options.outputPath}favicon`,
            // {
            //     type: 'inline',
            //     content: buffer.toString('base64')
            // }

            this.request = rfg.createRequest(args);

            // If we are injecting into some HTML, do the work once html-webpack-plugin is
            // ready to emit assets https://github.com/jantimon/html-webpack-plugin#beforeemit-hook
            if (this.options.inject === true) {
                // HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(NAME, (data, next) => {
                //     this.generateFavicons((err, res) => {
                //         if (err) {
                //             return next(err);
                //         }

                //         data.html = data.html.replace('</head>', `${res.favicon.html_code}</head>`);
                //         next(null, data);
                //     });
                // });
            }
        });

        if (this.options.inject !== true) {
            // If we're not injecting, generate the favicons just before Webpack
            // emits assets https://webpack.js.org/api/compiler-hooks/#emit
            compiler.hooks.emit.tapAsync(NAME, (compilation, next) => {
                this.generateFavicons((err, entries) => {
                    if (err) {
                        return next(err);
                    }

                    entries.forEach(entry => {
                        let filename = entry.name;

                        if (entry.name === 'html_code.html') {
                            filename = 'markup.html';
                        }

                        compilation.assets[`favicon/${filename}`] = {
                            source: () => entry.getData(),
                            size: () => entry.header.size
                        };
                    });

                    next(null, compilation);
                });
            });
        }
    }
}

module.exports = RealFaviconPlugin;
