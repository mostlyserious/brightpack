const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const chokidar = require('chokidar');
const DevServer = require('webpack-dev-server');

module.exports = config => {
    const __home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    const pem = `${__home}/.config/valet/CA/LaravelValetCASelfSigned.pem`;

    const options = {
        port: global.args.port,
        host: process.env.APP_HOST,
        server: {
            type: (global.args.https || process.env.APP_URL.includes('https:')) && fs.existsSync(pem)
                ? 'https'
                : undefined,
            options: global.args.https ? global.args.https : process.env.APP_URL.includes('https:') && fs.existsSync(pem) ? {
                key: fs.readFileSync(`${__home}/.config/valet/Certificates/${process.env.APP_HOST}.key`),
                cert: fs.readFileSync(`${__home}/.config/valet/Certificates/${process.env.APP_HOST}.crt`),
                ca: fs.readFileSync(pem)
            } : undefined
        },
        headers: { 'Access-Control-Allow-Origin': '*' },
        client: { logging: 'none' },
        static: false,
        allowedHosts: 'all',
        historyApiFallback: true,
        compress: true
    };

    const server = new DevServer(options, webpack(config));

    server.start(global.args.port, process.env.APP_HOST, () => {
        const usePolling = server.static && server.static.watchOptions.poll
            ? true
            : undefined; // eslint-disable-line no-undefined

        const interval = server.static && typeof server.static.watchOptions.poll === 'number'
            ? server.static.watchOptions.poll
            : undefined; // eslint-disable-line no-undefined

        if (global.args.watch && global.args.watch.length) {
            if (!Array.isArray(global.args.watch)) {
                global.args.watch = [ global.args.watch ];
            }

            global.args.watch.forEach(watch => {
                const watcher = chokidar.watch(path.resolve(watch), {
                    ignoreInitial: true,
                    persistent: true,
                    followSymlinks: false,
                    depth: 5,
                    atomic: false,
                    alwaysStat: true,
                    ignorePermissionErrors: true,
                    ignored: server.static ? server.static.watchOptions.ignored : undefined,
                    usePolling,
                    interval
                });

                watcher.on('change', () => {
                    server.sockWrite(server.sockets, 'content-changed');
                });

                if (server.contentBaseWatchers) {
                    server.contentBaseWatchers.push(watcher);
                } else {
                    server.contentBaseWatchers = [ watcher ];
                }
            });
        }
    });

    return config;
};
