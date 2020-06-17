const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const chokidar = require('chokidar');
const WebpackDevServer = require('webpack-dev-server');

module.exports = (config, args) => {
    const __home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    const pem = `${__home}/.config/valet/CA/LaravelValetCASelfSigned.pem`;
    const https = args.https ? args.https : process.env.APP_URL.includes('https:') && fs.existsSync(pem) ? {
        key: fs.readFileSync(`${__home}/.config/valet/Certificates/${process.env.APP_HOST}.key`),
        cert: fs.readFileSync(`${__home}/.config/valet/Certificates/${process.env.APP_HOST}.crt`),
        ca: fs.readFileSync(pem)
    } : false;

    const options = {
        port: args.port,
        host: process.env.APP_HOST,
        https,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        hot: true,
        clientLogLevel: 'none',
        disableHostCheck: true,
        contentBase: false,
        historyApiFallback: true,
        noInfo: true,
        compress: true,
        quiet: true
    };

    WebpackDevServer.addDevServerEntrypoints(config, options);

    const compiler = webpack(config);
    const server = new WebpackDevServer(compiler, options);

    server.listen(args.port, process.env.APP_HOST, () => {
        console.log(`webpack-dev-server listening on port ${args.port}`);

        const usePolling = server.watchOptions.poll
            ? true
            : undefined; // eslint-disable-line no-undefined

        const interval = typeof server.watchOptions.poll === 'number'
            ? server.watchOptions.poll
            : undefined; // eslint-disable-line no-undefined

        if (args.watch && args.watch.length) {
            if (!Array.isArray(args.watch)) {
                args.watch = [ args.watch ];
            }

            args.watch.forEach(watch => {
                const watcher = chokidar.watch(path.resolve(watch), {
                    ignoreInitial: true,
                    persistent: true,
                    followSymlinks: false,
                    depth: 5,
                    atomic: false,
                    alwaysStat: true,
                    ignorePermissionErrors: true,
                    ignored: server.watchOptions.ignored,
                    usePolling,
                    interval
                });

                watcher.on('change', () => {
                    server.sockWrite(server.sockets, 'content-changed');
                });

                server.contentBaseWatchers.push(watcher);
            });
        }
    });

    return config;
};
