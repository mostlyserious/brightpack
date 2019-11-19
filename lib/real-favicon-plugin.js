const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');
const rfgApi = require('rfg-api');
const unzip = require('node-unzip-2');
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
        // rfg.generateFavicon(this.request, this.options.outputPath, next);

        axios.post('https://realfavicongenerator.net/api/favicon', {
            'favicon_generation': this.request
        }).then(res => {
            // eslint-disable-next-line new-cap
            const unzipper = unzip.Parse();

            https.get(res.data.favicon_generation_result.favicon.package_url, res => {
                console.log('RES');
                res.pipe(unzipper).on('entry', entry => {
                    console.log('ENTRY', entry);
                    // entry.autodrain();
                }).on('close', () => {
                    console.log('CLOSE');
                    next(null);
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
            const buffer = fs.readFileSync(path.resolve('pin.svg'));
            // const jsonPath = path.join(compiler.context, this.options.faviconJson);
            // const json = require(jsonPath);
            // const outputPath = this.options.outputPath;

            if (!this.options.apikey) {
                this.options.apikey = apikey;

                if (!this.options.apikey) {
                    throw new Error(`${NAME}: No API key provided for Real Favicon Generator.`);
                }
            }

            const args = {
                apiKey: this.options.apikey,
                masterPicture: {
                    type: 'inline',
                    content: buffer.toString('base64')
                },
                design: {},
                versioning: false,
                settings: {
                    compression: 5,
                    scalingAlgorithm: 'Lanczos',
                    errorOnImageTooSmall: false,
                    readmeFile: false,
                    htmlCodeFile: false,
                    usePathAsIs: true
                }
                // iconsPath: json.iconsPath,
                // design: json.design,
                // settings: json.settings,
                // versioning: json.versioning
            };

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
                this.generateFavicons((err, entry) => {
                    if (err) {
                        return next(err);
                    }

                    // console.log(entry);

                    next(null, compilation);
                });
            });
        }
    }
}

module.exports = RealFaviconPlugin;
