##### webpack.config.js

```js
const path = require('path');
const glob = require('tiny-glob');
const extend = require('brightpack');

const dest = 'assets';
const watch = ['theme/**/*', '*.php'];
const publicPath = path.join('/wp-content/themes', path.basename(__dirname), dest, '/');

module.exports = extend({ dest, publicPath, watch }, async config => {
    const assets = await glob('src/{img,favicon,font,media}/**.*');

    config.entry = {
        app: [
            path.resolve('src/js/main.js'),
            path.resolve('src/sass/main.scss'),
            ...assets.map(path.resolve)
        ],
        dashboard: [
            path.resolve('src/js/admin.js'),
            path.resolve('src/sass/admin.scss')
        ],
        appearance: path.resolve('src/js/appearance.js'),
        gform: path.resolve('src/sass/gform.scss'),
        login: path.resolve('src/sass/login.scss'),
        wp: path.resolve('src/sass/wp.scss')
    };

    config.externals.jquery = 'jQuery';

    return config;
});
```

##### helpers.php

```php
if (!function_exists('asset')) {
    function asset($entry, $markup = false, $manifest = 'assets/manifest.json')
    {
        static $all;

        $entries = [];
        $found_css = [];
        $manifest_path = join_path(__DIR__, $manifest);

        if (!is_file($manifest_path)) {
            return $markup ? '' : [];
        }

        $all = $all ?: json_decode(file_get_contents($manifest_path), true);

        $type = pathinfo($entry, PATHINFO_DIRNAME);
        $basename = pathinfo($entry, PATHINFO_FILENAME);
        $ext = pathinfo($entry, PATHINFO_EXTENSION);

        foreach ($all as $key => $value) {
            if ($key === $entry || preg_match("/^$type\/.*~$basename.*\.$ext$/", $key)) {
                $id = sanitize_title(str_replace('~', '-', implode(' ', [
                    pathinfo($key, PATHINFO_FILENAME),
                    pathinfo($key, PATHINFO_EXTENSION)
                ])));

                switch ($type) {
                    case 'js' :
                        $resolved = $markup ? sprintf(
                            '<script src="%s" %s async defer></script>',
                            $value,
                            is_array($markup) ? attr($markup) : ''
                        ) : $value;
                        break;

                    case 'css' :
                        $resolved = $markup ? sprintf(
                            '<link href="%s" rel="stylesheet" %s>',
                            $value,
                            is_array($markup)
                                ? attr(array_merge($markup, isset($markup['onload']) ? [] : [
                                    'media' => 'bogus',
                                    'onload' => sprintf('this.media = \'%s\';', isset($markup['media']) ? $markup['media'] : 'all')
                                ]))
                                : 'media="bogus" onload="this.media = \'all\';"'
                        ) : $value;
                        break;
                    default :
                        return $value;
                }

                $entries[$id] = $resolved;
            }
        }

        return ($markup || !in_array($type, ['css', 'js']))
            ? implode("\n", $entries)
            : $entries;
    }
}

if (!function_exists('join_path')) {
    function join_path(...$paths)
    {
        return preg_replace_callback('/([^:])\/+/', function ($matches) {
            return $matches[1] . '/';
        }, implode('/', (array) $paths));
    }
}

if (!function_exists('attr')) {
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
}
```

