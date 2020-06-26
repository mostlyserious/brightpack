## Required Files

##### webpack.config.js

```js
const path = require('path');
const glob = require('tiny-glob/sync');
const brightpack = require('brightpack');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const RealFaviconPlugin = require('brightpack/lib/real-favicon-plugin');

const dest = 'public/assets';
const publicPath = '/assets/';
const watch = [ '*.php', 'views/**/*.php', 'app/**/*.php' ];

module.exports = brightpack({ dest, publicPath, watch }, config => {
    // `config` is just a pre-configured webpack config object with sensible defaults, nothing more.
    // Project specific values are then configured below.

    // Miscellaneous files that need to be processed and available in the template
    // such as images, fonts, or other media like PDFs or videos.
    const assets = glob('src/{img,font,media}/**.*');

    config.entry = {
        app: [
            path.resolve('src/js/main.js'),
            path.resolve('src/css/main.css'),
            ...assets.map(p => path.resolve(p))
        ],
        utilities: path.resolve('src/css/utilities.css')
    };

    config.plugins.push(new RealFaviconPlugin({
        filename: global.inProduction
            ? 'favicon/[name].[contenthash:7]'
            : 'favicon/[name]',
        config: path.resolve('src/favicon/config.json')
    }));

    if (global.inProduction) {
        // Not necessary, but allows you to see how much of your final javascript
        // is polyfills for browser support. Will be reflective of modern
        // javascript used and required browser support in .browserslistrc
        config.optimization.splitChunks.cacheGroups.polyfill = {
            name: 'polyfill',
            test: /\/core-js\//,
            chunks: 'all',
            enforce: true
        };

        // Removed unused CSS classes from the tailwind utilities stylesheet.
        config.plugins.push(new PurgecssPlugin({
            // Only runs on the utilites entry configured above.
            only: [
                'utilities'
            ],
            // All the locations that CSS classes may be used.
            paths: () => [
                glob('views/**/*.php'),
                glob('src/js/**/*.{js,svelte}')
            ].flat(),
            extractors: [
                {
                    // similar to previous above config but simply filtering by extension.
                    extensions: [ 'svelte', 'html', 'php' ],
                    // Defines what characters can actually be part of a class name.
                    // This is explicitly set for some extra, unconventional
                    // (but perfectly valid) characters used in tailwind.
                    extractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
                }
            ]
        }));
    }

    // returns the finished configuration to webpack.
    return config;
});
```

##### helpers.php

```php
function entry($entry = null, $markup = false, $manifest = 'public/assets/entries.json')
{
    static $all;

    $results = [];
    $manifest_path = join_path(__DIR__, $manifest);

    if (!is_file($manifest_path)) {
        return $markup ? '' : [];
    }

    $all = $all ?: json_decode(file_get_contents($manifest_path), true);

    if (!$entry) {
        return $all;
    }

    if (!isset($all[$entry])) {
        return [];
    }

    foreach ($all[$entry] as $i => $value) {
        $ext = pathinfo($value, PATHINFO_EXTENSION);

        switch ($ext) {
            case 'js' :
                $result = $markup ? sprintf(
                    '<script src="%s" %s async defer></script>',
                    $value,
                    is_array($markup) ? attr($markup, ['media']) : ''
                ) : $value;
                break;

            case 'css' :
                $result = $markup ? sprintf(
                    '<link href="%s" rel="stylesheet" %s>',
                    $value,
                    is_array($markup) ? attr($markup) : ''
                ) : $value;
                break;
            default :
                $result = '';
                break;
        }

        preload($value);

        $results[] = $result;
    }

    return $markup ? implode(PHP_EOL, $results) : $results;
}

function asset($entry = null, $markup = false, $manifest = 'public/assets/assets.json')
{
    static $all;

    $manifest_path = join_path(__DIR__, $manifest);

    if (!is_file($manifest_path)) {
        return $markup ? '' : [];
    }

    $all = $all ?: json_decode(file_get_contents($manifest_path), true);

    if (!$entry) {
        return $all;
    }

    if (isset($all[$entry])) {
        if (pathinfo($all[$entry], PATHINFO_EXTENSION) !== 'html') {
            preload($all[$entry]);
        }

        return $all[$entry];
    }

    return null;
}

function preload($resource)
{
    static $pushed = [];

    if (!is_array($resource)) {
        $resource = [$resource];
    }

    foreach ($resource as $r) {
        $types = ['css' => 'style', 'js' => 'script'];
        $ext = pathinfo($r, PATHINFO_EXTENSION);
        $as = isset($types[$ext]) ? $types[$ext] : 'image';
        if (!in_array($r, $pushed)) {
            header(sprintf('Link: <%s>; as=%s; rel=preload;', url($r), $as), false);
            $pushed[] = $r;
        }
    }

    return $resource;
}

function attr($attributes = [], $except = [])
{
    $html = [];

    foreach ((array) $attributes as $key => $value) {
        if (!is_null($value)) {
            if (is_numeric($key)) {
                if (!in_array($value, (array) $except)) {
                    $pair = $value;
                }
            } else {
                if (!in_array($key, (array) $except)) {
                    $pair = $key .'="'. $value .'"';
                }
            }
        }

        if (!is_null($pair)) {
            $html[] = $pair;
        }
    }

    return count($html) > 0 ? ' '.implode(' ', $html) : '';
}

function join_path(...$paths)
{
    return preg_replace_callback('/([^:])\/+/', function ($matches) {
        return $matches[1] . '/';
    }, implode('/', (array) $paths));
}
```

## Optional (But Recommended) Files

##### babel.config.js

```js
module.exports = {
    plugins: [
        '@babel/syntax-dynamic-import'
    ],
    presets: [
        [ '@babel/env', {
            corejs: 3,
            modules: false,
            useBuiltIns: 'usage',
            shippedProposals: true
        } ]
    ]
};
```

##### postcss.config.js

```js
module.exports = {
    plugins: {
        'postcss-import': {},
        'tailwindcss': {},
        'postcss-functions': {
            functions: {
                'svg-uri': value => {
                    const svg = value
                        .replace(/^['"]|['"]$/g, '')
                        .replace(/%/g, '%25')
                        .replace(/</g, '%3C')
                        .replace(/>/g, '%3E')
                        .replace(/&/g, '%26')
                        .replace(/#/g, '%23')
                        .replace(/{/g, '%7B')
                        .replace(/}/g, '%7D');

                    return `url(${JSON.stringify(`data:image/svg+xml;charset=utf-8,${svg}`)})`;
                }
            }
        },
        'postcss-nesting': {},
        'postcss-color-function': {},
        'postcss-preset-env': global.inProduction ? {
            'autoprefixer': { flexbox: 'no-2009', grid: 'no-autoplace' }
        } : false
    }
};
```

## Options

#### dest
Destination of compiled assets relative to webpack.config.js
https://webpack.js.org/configuration/output/#outputpath

#### publicPath
Destination of compiled assets relative to the web root used for the full URL
(leading slash will start at domain root, always include the trailing slash.)
https://webpack.js.org/configuration/output/#outputpublicpath

#### watch
Files that aren't compiled that need to trigger a page reload when changed. (dev mode only)
https://webpack.js.org/configuration/watch/#watch

#### filename
The name or template for the output files. Applies to all files—JS, CSS, images, etc.
https://webpack.js.org/configuration/output/#outputfilename

#### chunkNameLength
Webpack generates chunks to shared code from being loaded more then it needs to be, the chunk names are generated by combining the filenames of an file that uses the chunk. This let's you truncate each filename used so that the combined length is not ridiculous. (default: 3)

#### name
If using multiple build configs, assign a unique name to keep them from clashing. See collegiatedayofprayer.org for an example of this.

#### port
If running more than one instance of the a config, whether in a single project or running dev for more than one project on your system at one time, you will need to provide a different port for webpack to use. (default: 8888)

#### mode
Automatically assigned dependent on the script run (either npm run dev or npm run build), but can be manually overwritten here.

## What's Included

### Loaders

#### Vue
[vue-loader](https://vue-loader.vuejs.org/)

Build caching is configured by default.

#### Babel
[babel-loader](https://github.com/babel/babel-loader)

Babel will exclude `node_modules` by default. In this config I have made exceptions for svelte, vue, bootstrap out of the box.  
If you have included another package that needs to be compiled from modern JS to support older browsers, add it as an exception in the webpack.config.js with the following code. In this example, `xallarap` has been added as an exception to the excluded directories.

```js
brightpack.editLoader(config, 'babel-loader', (use, rule) => {
    rule.exclude = /node_modules\/(?!svelte|vue|bootstrap|xallarap)/;
});
```

Build caching is configured by default.

#### CSS
[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) (for build)  
[style-loader](https://github.com/webpack-contrib/style-loader) (for dev)  
[css-loader](https://github.com/webpack-contrib/css-loader)  
[postcss-loader](https://github.com/postcss/postcss-loader)

All of the loaders needed for CSS compilation have been included and configured out of the box. Nothing special going on, just basic requirements.

#### SASS
[sass-loader](https://github.com/webpack-contrib/sass-loader)

A little configuration to have SASS imports work the same as webpack imports.

#### LESS
[less-loader](https://github.com/webpack-contrib/less-loader)

#### Images
[tinify-loader](https://github.com/corneliusio/tinify-loader)  
[svgo-loader](https://github.com/rpominov/svgo-loader)

Optimizes PNG, JPG, and SVG size with TinyPNG and SVGO.

#### Media, Fonts, Images
[file-loader](https://github.com/webpack-contrib/file-loader)

No real compilation happens here, just copies files with the global file name configuration (which primarily applies to cache busting).

#### Raw
[raw-loader](https://github.com/webpack-contrib/raw-loader)

Allows you to include HTML and text files as strings in Javascript.  
(I believe JSON is already supported by webpack by default.)

#### Svelte
[svelte-loader](https://github.com/sveltejs/svelte-loader)

Compiles Svelte components, but also applies the same configuration as your other CSS, PostCSS, and SASS files to styles embedded in the components.

#### ESLint
[eslint-loader](https://github.com/webpack-contrib/eslint-loader)

*If* you have eslint installed for you project, will add it to your webpack config for warning and errors to be displayed in the terminal.

### Plugins

#### TerserPlugin
[terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin)  
Used to minify Javascript

#### ManifestPlugin
[webpack-manifest-plugin](https://github.com/danethurber/webpack-manifest-plugin)  
Creates two manifest files of all compiled files generated for a specific source file. This let's you use a function like `entry('app')` to get all generated Javascript and CSS files or `asset('img/logo.png')` to retrieve the full path to the cache busted filename.

#### CleanWebpackPlugin
[clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin)  
This removes all old files from previous builds so that only the current version of the files end up in the final assets directory.

#### MiniCssExtractPlugin
[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)  
This extracts all of you CSS into actual CSS files since webpack simply wraps CSS in Javascript files and loads them dynamically by default. (which is not performance friendly)

#### CssoWebpackPlugin
[csso-webpack-plugin](https://github.com/zoobestik/csso-webpack-plugin)  
Used to minify CSS.

#### RemoveEmptyEntriesPlugin
(this is the only custom built loader or plugin in brightpack. There is no configuration, but can be removed like any other plugin.)
Webpack sometimes generates "empty" javascript files for non-javascript assets it processes such as images or CSS, this cleans up (most of) these un-needed files.

#### MomentLocalesPlugin
[moment-locales-webpack-plugin](https://github.com/iamakulov/moment-locales-webpack-plugin)  
Moment.js is extremely useful for working with dates and times in JS, but it also comes with a lot of localization files which result in a *HUGE* compiled file. If you're only developing for english, you don't need these extra localizations. This plugin removes them.

#### VueLoaderPlugin
[vue-loader](https://vue-loader.vuejs.org/)  
This plugin is essentially just companion to the vue-loader.

Any plugin can be removed with the following code. You could then re-add the plugin with a different configuration if you needed.

```js
brightpack.removePlugin(config, 'PluginName');
```
