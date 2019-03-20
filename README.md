##### webpack.config.js

```js
const path = require('path');
const glob = require('tiny-glob/sync');
const brightpack = require('brightpack');

const dest = 'assets';
const watch = ['theme/**/*', '*.php'];
const publicPath = path.join('/wp-content/themes', path.basename(__dirname), dest, '/');

module.exports = brightpack({ dest, publicPath, watch }, config => {
    const assets = glob('src/{img,favicon,font,media}/**.*');

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
if (!function_exists('assets')) {
    function assets($entries = null, $markup = false, $manifest = 'assets/manifest.json')
    {
        static $all;

        $results = [];
        $found_css = [];
        $manifest_path = join_path(ROOT_DIR, $manifest);

        if (!is_file($manifest_path)) {
            return $markup ? '' : [];
        }

        $all = $all ?: json_decode(file_get_contents($manifest_path), true);

        if (!$entries) {
            return $all;
        }

        if (is_array($entries)) {
            $type = null;
        } else {
            $type = pathinfo($entries, PATHINFO_DIRNAME);
            $entries = [$entries];
        }

        foreach ($entries as $entry) {
            $basename = pathinfo($entry, PATHINFO_FILENAME);
            $ext = pathinfo($entry, PATHINFO_EXTENSION);

            foreach ($all as $key => $value) {
                if ($key === $entry || preg_match("/^$type\/.*~$basename.*\.$ext$/", $key)) {
                    switch ($type) {
                        case 'js' :
                            $result = $markup ? sprintf(
                                '<script src="%s" %s async defer></script>',
                                $value,
                                is_array($markup) ? attr($markup) : ''
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
                            if (count($entries) === 1) {
                                return $value;
                            }

                            $result = $value;
                            break;
                    }

                    $id = sanitize_title(str_replace('~', '-', implode(' ', [
                        pathinfo($key, PATHINFO_FILENAME),
                        pathinfo($key, PATHINFO_EXTENSION)
                    ])));

                    $results[$id] = $result;
                }
            }
        }

        return $markup ? implode("\n", $results) . "\n" : $results;
    }
}

if (!function_exists('preload')) {
    function preload($as, $resource, $expiration = null)
    {
        $pushed = [];
        $expiration = $expiration ?: 60 * 60 * 24 * 30;
        $prev = isset($_COOKIE['pushed']) ? json_decode($_COOKIE['pushed']) : [];

        if (!is_array($resource)) {
            $resource = [$resource];
        }

        foreach ($resource as $r) {
            $ext = pathinfo($r, PATHINFO_EXTENSION);
            $pushed[] = $r;
            if (!in_array($r, $prev)) {
                header(sprintf('Link: <%s>; as=%s; rel=preload;', $r, $as), false);
            }
        }

        setcookie('pushed', json_encode($pushed), 0, ($expiration + time()));

        return $resource;
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

if (!function_exists('join_path')) {
    function join_path(...$paths)
    {
        return preg_replace_callback('/([^:])\/+/', function ($matches) {
            return $matches[1] . '/';
        }, implode('/', (array) $paths));
    }
}
```

