const fs = require('fs');
const webpack = require('webpack');
const DevServer = require('webpack-dev-server');

module.exports = config => {
    const __home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    const pem = `${__home}/.config/valet/CA/LaravelValetCASelfSigned.pem`;

    if (global.args.watch && !Array.isArray(global.args.watch)) {
        global.args.watch = [ global.args.watch ];
    }

    const options = {
        port: global.args.port,
        host: process.env.APP_HOST,
        watchFiles: global.args.watch
            ? global.args.watch
            : undefined,
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

    server.start(global.args.port, process.env.APP_HOST);

    return config;
};
