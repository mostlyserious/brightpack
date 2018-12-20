let fs = require('fs'),
    path = require('path'),
    dotenv = require('dotenv'),
    webpack = require('webpack'),
    chokidar = require('chokidar'),
    requireOptional = require('./util/require-optional');

const TerserPlugin = require('terser-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssoWebpackPlugin = require('csso-webpack-plugin').default;
const { NamedModulesPlugin, HotModuleReplacementPlugin } = webpack;
const RemoveEmptyEntriesPlugin = require('./util/remove-empty-entries-plugin');

try {
    (env => Object.keys(env).forEach(key => {
        process.env[key] = env[key].replace(/\$\{(.+)\}/gi, (original, a) => env[a]);
    }))(dotenv.load({ silent: true }).parsed);
} catch (error) {
    console.warn('No .env file');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.HMR_PORT = process.env.HMR_PORT || 8888;
process.env.APP_HOST = process.env.APP_HOST || 'localhost';
process.env.APP_URL = process.env.APP_URL || `http://${process.env.APP_HOST}`;
global.inProduction = process.env.NODE_ENV === 'production';

module.exports = async (config, extend) => {

    let { dest, publicPath, watch, filename, sass } = config;

    global.sass = sass || 'node-sass';

    publicPath = publicPath || `/${dest}/`;
    filename = filename || '[name].[contenthash:7]';

    const base = {
        target: 'web',
        context: process.cwd(),
        watch: !global.inProduction,
        stats: {
            moduleTrace: false,
            hash: false,
            builtAt: false,
            modules: false,
            version: false,
            children: false,
            entrypoints: false
        }
    };

    base.output = {
        filename: global.inProduction ? `js/${filename}.js` : 'js/[name].js',
        path: path.resolve(dest),
        publicPath: global.inProduction ? publicPath : `${process.env.APP_URL}:${process.env.HMR_PORT}/`,
        hotUpdateChunkFilename: 'hmr/[id].[hash].hot-update.js',
        hotUpdateMainFilename: 'hmr/[hash].hot-update.json'
    };

    base.resolve = {
        extensions: ['*', '.js'],
        alias: { '@': path.resolve(process.cwd(), 'src') }
    };

    base.externals = {};

    base.module = {
        rules: [
            require('./loaders/eslint'),
            require('./loaders/vue'),
            require('./loaders/babel'),
            require('./loaders/css'),
            require('./loaders/editor-css'),
            require('./loaders/sass'),
            require('./loaders/editor-sass'),
            require('./loaders/less'),
            require('./loaders/editor-less'),
            require('./loaders/image'),
            require('./loaders/media'),
            require('./loaders/favicon'),
            require('./loaders/tinypng'),
            require('./loaders/svgo'),
            require('./loaders/font'),
            require('./loaders/svelte'),
            require('./loaders/raw')
        ]
    };

    base.plugins = [
        new CleanWebpackPlugin(dest, {
            root: process.cwd(),
            verbose: false
        }),
        new ManifestPlugin({
            fileName: 'entries.json',
            writeToFileEmit: true,
            generate(seed, files) {
                return files.reduce((manifest, file) => {
                    return (file.isInitial && !file.name.includes('.map'))
                        ? { ...manifest, [file.name]: file.path }
                        : manifest;
                }, seed);
            }
        })
    ];

    if (requireOptional('moment')) {
        const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

        base.plugins.push(new MomentLocalesPlugin());
    }

    if (requireOptional('vue')) {
        const { VueLoaderPlugin } = require('vue-loader');

        base.plugins.push(new VueLoaderPlugin());
    }

    if (global.inProduction) {
        base.mode = 'production';
        base.devtool = 'none';

        base.output.chunkFilename = `js/${filename}.js`;
        base.output.sourceMapFilename = `${filename}.map`;

        base.optimization = {
            splitChunks: {
                chunks: 'all',
                minSize: 1024 * 10,
                cacheGroups: {
                    polyfills: {
                        test: /[\\/]core-js[\\/]/,
                        name: 'polyfills',
                        chunks: 'all'
                    }
                }
            },
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    cache: path.resolve('.cache/terser')
                })
            ]
        };

        base.plugins.push(new MiniCssExtractPlugin({
            filename: `css/${filename}.css`,
            chunkFilename: `css/${filename}.css`
        }));

        base.plugins.push(new CssoWebpackPlugin());

        base.plugins.push(new RemoveEmptyEntriesPlugin());
    } else {
        base.mode = 'development';
        base.devtool = 'cheap-module-eval-source-map';

        base.output.chunkFilename = 'js/[name].js';
        base.output.sourceMapFilename = '[name].map';

        base.plugins.push(new NamedModulesPlugin());

        base.plugins.push(new HotModuleReplacementPlugin());
    }

    return global.inProduction ? await extend(base) : hmr(await extend(base), watch);
};

function hmr(config, watch) {
    const __home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    const options = {
        host: process.env.APP_HOST,
        port: process.env.HMR_PORT,
        https: (process.env.APP_URL.includes('https:')) ? {
            key: fs.readFileSync(`${__home}/.config/valet/Certificates/${process.env.APP_HOST}.key`),
            cert: fs.readFileSync(`${__home}/.config/valet/Certificates/${process.env.APP_HOST}.crt`),
            ca: fs.readFileSync(`${__home}/.config/valet/CA/LaravelValetCASelfSigned.pem`)
        } : false,
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

    server.listen(process.env.HMR_PORT, process.env.APP_HOST, () => {
        console.log(`webpack-dev-server listening on port ${process.env.HMR_PORT}`);

        const usePolling = server.watchOptions.poll
            ? true
            : undefined; // eslint-disable-line no-undefined

        const interval = typeof server.watchOptions.poll === 'number'
            ? server.watchOptions.poll
            : undefined; // eslint-disable-line no-undefined

        if (watch && watch.length) {
            if (!Array.isArray(watch)) {
                watch = [watch];
            }

            watch.forEach(watch => {
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
}
