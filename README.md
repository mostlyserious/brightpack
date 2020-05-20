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
        config.optimization.splitChunks.cacheGroups.polyfill = {
            name: 'polyfill',
            test: /\/core-js\//,
            chunks: 'all',
            enforce: true
        };

        config.plugins.push(new PurgecssPlugin({
            only: [
                'utilities'
            ],
            paths: () => [
                glob('views/**/*.php'),
                glob('src/js/**/*.{js,svelte}')
            ].flat(),
            extractors: [
                {
                    extensions: [ 'svelte', 'html', 'php' ],
                    extractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
                }
            ]
        }));
    }

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
        'autoprefixer': global.inProduction
            ? { flexbox: 'no-2009', grid: 'no-autoplace' }
            : false,
        'postcss-nesting': {},
        'postcss-color-function': {}
    }
};
```
