const path = require('path');
const dotenv = require('dotenv');
const hmr = require('./lib/hmr');
const webpack = require('webpack');
const { cloneDeep } = require('lodash');
const editLoader = require('./util/edit-loader');
const removePlugin = require('./util/remove-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const requireOptional = require('./lib/require-optional');
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssoWebpackPlugin = require('csso-webpack-plugin').default;
const { NamedModulesPlugin, HotModuleReplacementPlugin } = webpack;
const RemoveEmptyEntriesPlugin = require('./lib/remove-empty-entries-plugin');

try {
    (env => Object.keys(env).forEach(key => {
        process.env[key] = env[key].replace(/\$\{(.+)\}/gi, (original, a) => env[a]);
    }))(dotenv.config().parsed);
} catch (error) {
    console.warn('No .env file');
}

module.exports = (args, extend) => {
    // eslint-disable-next-line complexity
    return (env, { mode }) => {
        args.port = args.port || 8888;
        args.mode = mode || 'production';
        args.publicPath = args.publicPath || `/${args.dest}/`;
        args.filename = args.filename || '[name].[contenthash:7]';

        process.env.NODE_ENV = args.mode;
        process.env.APP_HOST = process.env.APP_HOST || 'localhost';
        process.env.APP_URL = process.env.APP_URL || `http://${process.env.APP_HOST}`;

        global.inProduction = args.mode === 'production';

        const base = {
            target: 'web',
            context: process.cwd(),
            mode: args.mode,
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
            filename: global.inProduction ? `js/${args.filename}.js` : 'js/[name].js',
            path: path.resolve(args.dest),
            publicPath: global.inProduction ? args.publicPath : `${process.env.APP_URL}:${args.port}/`,
            hotUpdateChunkFilename: 'hmr/[id].[hash].hot-update.js',
            hotUpdateMainFilename: 'hmr/[hash].hot-update.json'
        };

        base.resolve = {
            // extensions: ['*', '.js'],
            alias: { '@': path.resolve(process.cwd(), 'src') }
        };

        base.externals = {};

        base.module = {
            rules: [
                // require('./loaders/eslint'),
                require('./loaders/vue'),
                require('./loaders/babel'),
                require('./loaders/css'),
                require('./loaders/sass'),
                require('./loaders/less'),
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

        editLoader(base, 'file-loader', (loader, rule) => {
            if (rule.test.toString() !== '/\\/media\\//') {
                loader.options.name = global.inProduction ? `${args.filename}.[ext]` : '[name].[ext]';
            }
        });

        editLoader(base, 'vue-loader', (loader, rule) => {
            loader.options.cacheIdentifier = `${loader.options.cacheIdentifier} ${args.mode}`;
        });

        base.plugins = [
            new ManifestPlugin({
                fileName: 'manifest.json',
                writeToFileEmit: true,
                generate(seed, files) {
                    files.forEach(file => {
                        const extension = path.extname(file.name).replace('.', '');
                        const filename = file.isAsset ? file.name : `${extension}/${file.name}`;

                        return seed[filename] = file.path;
                    });

                    return seed;
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
            base.devtool = 'none';

            base.output.chunkFilename = `js/${args.filename}.js`;
            base.output.sourceMapFilename = `${args.filename}.map`;

            base.optimization = {
                splitChunks: {
                    chunks: 'all',
                    minSize: 1024 * 10,
                    cacheGroups: {
                        polyfills: {
                            test: /[\\/]core-js[\\/]/,
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
                filename: `css/${args.filename}.css`,
                chunkFilename: `css/${args.filename}.css`
            }));

            base.plugins.push(new CssoWebpackPlugin());
            base.plugins.push(new RemoveEmptyEntriesPlugin());
            base.plugins.push(new CleanWebpackPlugin({ verbose: false }));
        } else {
            base.devtool = 'cheap-module-eval-source-map';

            base.output.chunkFilename = 'js/[name].js';
            base.output.sourceMapFilename = '[name].map';

            base.plugins.push(new NamedModulesPlugin());
            base.plugins.push(new HotModuleReplacementPlugin()); // Possible Svelte Issue, need to check this again.
        }

        const instance = cloneDeep(base);

        return global.inProduction
            ? extend(instance)
            : hmr(extend(instance), args);
    };
};

module.exports.removePlugin = removePlugin;
module.exports.editLoader = editLoader;
