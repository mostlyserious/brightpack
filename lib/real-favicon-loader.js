const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const rfgApi = require('rfg-api');
const AdmZip = require('adm-zip');
const { getOptions } = require('loader-utils');

const rfg = rfgApi.init();
const userhome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const apikeypath = path.join(userhome, '.realfavicon');
const NAME = 'Real Favicon Loader';

module.exports = function(content, map, meta) {
    const done = this.async();
    const options = getOptions(this) || {};

    options.cache = path.resolve(options.cache || '.cache/favicon');

    const checksum = crypto.createHash('sha1').update(content.toString('utf8')).digest('hex');
    const checksumdir = path.join(options.cache, checksum);

    if (fs.existsSync(checksumdir)) {
        // fs.readFile(checksumdir, (error, body) => {
        //     return done(null, body);
        // });
    } else {
        if (!options.apikey) {
            if (process.env.REALFAVICON_KEY) {
                options.apikey = process.env.REALFAVICON_KEY;
            } else if (fs.existsSync(apikeypath)) {
                options.apikey = fs.readFileSync(apikeypath, 'utf8').trim();
            }

            if (!options.apikey) {
                this.emitWarning(new Error(`${NAME}: No API key provided for Real Favicon Generator.`));

                return done(null, content);
            }
        }

        if (!fs.existsSync(options.cache)) {
            options.cache.split(path.sep).reduce((current, next) => {
                const full = path.resolve(current, next);

                try {
                    if (full !== '/') {
                        fs.mkdirSync(full);
                    }
                } catch (error) {
                    if (error.code !== 'EEXIST') {
                        return done(new Error(`${NAME}: ${error.message}`));
                    }
                }

                return full;
            }, '/');
        }

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
};

module.exports.raw = true;
