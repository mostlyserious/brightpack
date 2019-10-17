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
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { NamedModulesPlugin, HotModuleReplacementPlugin } = webpack;
const { default: CssoWebpackPlugin } = require('csso-webpack-plugin');
const RemoveEmptyEntriesPlugin = require('./lib/remove-empty-entries-plugin');

try {
    (env => Object.keys(env).forEach(key => {
        process.env[key] = env[key].replace(/\$\{(.+)\}/gi, (original, a) => env[a]);
    }))(dotenv.config().parsed);
} catch (error) {
    console.warn('No .env file');
}

module.exports = (args = {}, extend = c => c) => {
    // eslint-disable-next-line complexity
    return (env, { mode }) => {
        args.port = args.port || 8888;
        args.mode = mode || 'production';
        args.publicPath = args.publicPath || `/${args.dest || 'dist'}/`;
        args.filename = args.filename || '[name].[contenthash:7]';

        process.env.NODE_ENV = args.mode;
        process.env.APP_HOST = process.env.APP_HOST || 'localhost';
        process.env.APP_URL = process.env.APP_URL || `http://${process.env.APP_HOST}`;

        global.inProduction = args.mode === 'production';

        let base = {
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

        base = cloneDeep(base);

        base.name = args.name || '';

        base.output = {
            filename: path.join(base.name, global.inProduction ? `js/${args.filename}.js` : 'js/[name].js'),
            path: args.dest ? path.resolve(args.dest) : args.dest,
            publicPath: global.inProduction ? args.publicPath : `${process.env.APP_URL}:${args.port}/`,
            hotUpdateChunkFilename: path.join(base.name, 'hmr/[id].[hash].hot-update.js'),
            hotUpdateMainFilename: path.join(base.name, 'hmr/[hash].hot-update.json')
        };

        base.resolve = {
            extensions: [ '.wasm', '.mjs', '.js', '.jsx', '.json' ],
            alias: { '@': path.resolve(process.cwd(), 'src') }
        };

        base.externals = {};

        base.module = {
            rules: [
                cloneDeep(require('./loaders/vue')),
                cloneDeep(require('./loaders/babel')),
                cloneDeep(require('./loaders/css')),
                cloneDeep(require('./loaders/sass')),
                cloneDeep(require('./loaders/less')),
                cloneDeep(require('./loaders/image')),
                cloneDeep(require('./loaders/media')),
                cloneDeep(require('./loaders/favicon')),
                cloneDeep(require('./loaders/tinypng')),
                cloneDeep(require('./loaders/svgo')),
                cloneDeep(require('./loaders/font')),
                cloneDeep(require('./loaders/raw')),
                cloneDeep(require('./loaders/svelte')),
                cloneDeep(requireOptional('eslint')
                    ? require('./loaders/eslint')
                    : null)
            ].filter(Boolean)
        };

        editLoader(base, 'babel-loader', (loader, rule) => {
            loader.options.envName = base.name;
            loader.options.cacheDirectory = `${loader.options.cacheDirectory}/${base.name}`;
        });

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
                fileName: 'assets.json',
                writeToFileEmit: true,
                generate(seed, files, entrypoints) {
                    files.forEach(file => {
                        if (file.isAsset) {
                            seed[file.name] = file.path;
                        }
                    });

                    return seed;
                }
            }),
            new ManifestPlugin({
                fileName: 'entries.json',
                writeToFileEmit: true,
                generate(seed, files, entrypoints) {
                    Object.keys(entrypoints).forEach(entry => {
                        const items = entrypoints[entry];

                        seed[entry] = items.map(item => {
                            return files
                                .map(file => file.path)
                                .find(path => path.endsWith(item));
                        });
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

            base.output.chunkFilename = path.join(base.name, `js/${args.filename}.js`);
            base.output.sourceMapFilename = path.join(base.name, `${args.filename}.map`);

            base.optimization = {
                splitChunks: {
                    chunks: 'all',
                    minChunks: 2,
                    minSize: 1024 * 10,
                    name(module, chunks, cacheGroupKey) {
                        const allChunksNames = chunks.map(item => item.name.substring(0, 3));

                        return `${cacheGroupKey}.${allChunksNames.join('~')}`;
                    },
                    cacheGroups: {
                        polyfills: {
                            test: /\/core-js\//,
                            chunks: 'all'
                        }
                    }
                },
                minimizer: [
                    new TerserPlugin({
                        cache: path.resolve('.cache/terser')
                    }),
                    new CssoWebpackPlugin({
                        comments: false
                    })
                ]
            };

            base.plugins.push(new MiniCssExtractPlugin({
                filename: path.join(base.name, `css/${args.filename}.css`),
                chunkFilename: path.join(base.name, `css/${args.filename}.css`)
            }));

            base.plugins.push(new RemoveEmptyEntriesPlugin());
            base.plugins.push(new CleanWebpackPlugin({ verbose: false }));
        } else {
            base.devtool = 'cheap-module-eval-source-map';

            base.output.chunkFilename = path.join(base.name, 'js/[name].js');
            base.output.sourceMapFilename = path.join(base.name, '[name].map');

            base.plugins.push(new NamedModulesPlugin());
            base.plugins.push(new HotModuleReplacementPlugin());
        }

        return global.inProduction
            ? extend(base)
            : hmr(extend(base), args);
    };
};

module.exports.removePlugin = removePlugin;
module.exports.editLoader = editLoader;
