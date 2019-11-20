const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const rfgApi = require('rfg-api');
const isUtf8 = require('is-utf8');
const AdmZip = require('adm-zip');

const NAME = 'RealFaviconPlugin';
const TEMPLATED_PATH_REGEXP = /\[(contenthash|name|ext)(?::(\d+))?\]/gi;

const userhome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const apikeypath = path.join(userhome, '.realfavicon');
const rfg = rfgApi.init();

let apiKey;

if (process.env.REALFAVICON_KEY) {
    apiKey = process.env.REALFAVICON_KEY;
} else if (fs.existsSync(apikeypath)) {
    apiKey = fs.readFileSync(apikeypath, 'utf8').trim();
}

class RealFaviconPlugin {
    constructor(options) {
        options.filename = options.filename || '[name].[ext]';
        this.options = options;
        this.configContext = path.dirname(this.options.config);
    }

    apply(compiler) {
        // Hook into https://webpack.js.org/api/compiler-hooks#thiscompilation
        compiler.hooks.thisCompilation.tap(NAME, compilation => {
            const content = fs.readFileSync(this.options.config, 'utf8');
            const args = this.normalizeRequest(content);

            args.apiKey = apiKey;
            args.iconsPath = compiler.options.output.publicPath;

            if (!args.apiKey) {
                throw new Error(`${NAME}: No API key provided for Real Favicon Generator.`);
            }

            this.request = rfg.createRequest(args);
            this.ident = this.hash(JSON.stringify(this.request));
            this.cache = path.resolve(this.options.cache || '.cache/favicon');

            if (!fs.existsSync(this.cache)) {
                this.cache.split(path.sep).reduce((current, next) => {
                    const full = path.resolve(current, next);

                    try {
                        if (full !== '/') {
                            fs.mkdirSync(full);
                        }
                    } catch (error) {
                        if (error.code !== 'EEXIST') {
                            return next(new Error(`${NAME}: ${error.message}`));
                        }
                    }

                    return full;
                }, '/');
            }
        });

        if (this.options.inject !== true) {
            // If we're not injecting, generate the favicons just before Webpack
            // emits assets https://webpack.js.org/api/compiler-hooks/#emit
            compiler.hooks.emit.tapAsync(NAME, (compilation, next) => {
                this.fetchFavicons((err, entries) => {
                    if (err) {
                        return next(err);
                    }

                    entries = entries.map(entry => {
                        if (!this.options.filename.endsWith('.[ext]')) {
                            this.options.filename += '.[ext]';
                        }

                        const map = {
                            ext: path.extname(entry.name).replace(/^\./, ''),
                            name: entry.name !== 'html_code.html'
                                ? path.basename(entry.name, path.extname(entry.name)) : 'markup',
                            contenthash: this.hash(entry.toString('utf8'))

                        };

                        return {
                            original: entry,
                            filename: this.templatedPath(map, compiler.options.output.hashDigestLength),
                            source: entry.getData()
                        };
                    });

                    entries.forEach(entry => {
                        if (isUtf8(entry.source)) {
                            entry.source = this.updateBuffer(entry.source, entries);
                        }

                        compilation.assets[entry.filename] = {
                            source: () => entry.source,
                            size: () => entry.source.byteLength
                        };
                    });

                    next(null, compilation);
                });
            });
        }
    }

    fetchFavicons(next) {
        const checksumfile = path.join(this.cache, this.ident);

        if (fs.existsSync(checksumfile)) {
            this.unpackFavicons(fs.createReadStream(checksumfile), next);
        } else {
            axios.post('https://realfavicongenerator.net/api/favicon', {
                'favicon_generation': this.request
            }).then(res => {
                https.get(res.data.favicon_generation_result.favicon.package_url, res => {
                    this.unpackFavicons(res, next);
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
    }

    unpackFavicons(res, next) {
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

            const checksumfile = path.join(this.cache, this.ident);
            const zip = new AdmZip(buffer);

            if (!fs.existsSync(checksumfile)) {
                fs.writeFile(checksumfile, buffer, err => err && console.log(err));
            }

            next(null, zip.getEntries());
        });
    }

    normalizeRequest(json) {
        const config = JSON.parse(json);

        config.masterPicture = this.normalizeMasterPicture(config.masterPicture);
        config.design = this.normalizeDesignMasterPictures(config.design);

        return config;
    }

    normalizeMasterPicture(source) {
        return {
            type: 'inline',
            content: rfg.fileToBase64Sync(path.resolve(this.configContext, source))
        };
    }

    normalizeDesignMasterPictures(design) {
        if (design.constructor === Array) {
            for (let i = 0; i < design.length; i++) {
                design[i] = this.normalizeDesignMasterPictures(design[i]);
            }

            return design;
        } else if (design.constructor === Object) {
            let keys = Object.keys(design);

            for (let j = 0; j < keys.length; j++) {
                if (keys[j] === 'masterPicture') {
                    design[keys[j]] = this.normalizeMasterPicture(design[keys[j]]);
                } else {
                    design[keys[j]] = this.normalizeDesignMasterPictures(design[keys[j]]);
                }
            }

            return design;
        }

        return design;
    }

    templatedPath(map, fallbackHashLength) {
        let template = this.options.filename;

        if (map.ext === 'html') {
            template = template.replace(/\[contenthash(?::(\d+))?\][._-]?/gi, '');
        }

        return template.replace(TEMPLATED_PATH_REGEXP, (original, key, length) => {
            if (key === 'contenthash') {
                length = isNaN(length)
                    ? fallbackHashLength
                    : parseInt(length);

                return map[key].substring(0, length);
            }

            return map[key];
        });
    }

    updateBuffer(buffer, entries) {
        let content = buffer.toString();

        entries.forEach(entry => {
            content = content.replace(entry.original.name, entry.filename);
        });

        return Buffer.from(content);
    }

    hash(content) {
        return crypto
            .createHash('sha1')
            .update(content)
            .digest('hex');
    }
}

module.exports = RealFaviconPlugin;
