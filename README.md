
## Dependencies
Install dependencies.
```bash
npm i @mostlyserious/brightpack tailwindcss postcss postcss-functions postcss-import postcss-preset-env --save-dev
```
or
```bash
yarn add @mostlyserious/brightpack tailwindcss postcss postcss-functions postcss-import postcss-preset-env --dev
```

## Config
Run `brightpack init` to bootstrap all of the necessary config files.
- .browserslistrc
- .env
- .eslintrc.js
- babel.config.js
- postcss.config.js
- tailwind.config.js
- webpack.config.js

## package.json Script

Add the following scripts to your package.json

```json
{
    "scripts": {
        "dev": "webpack --mode=development --watch",
        "build": "webpack --mode=production"
    }
}
```

## External Config

### API Keys for Our Custom Build Tool

Our current build system requires API keys to tie into existing services. To set these up, navigate to these two URLs and use your email to generate a new API keys. 

- [https://realfavicongenerator.net/api](https://realfavicongenerator.net/api/)
- [https://tinypng.com/developer](https://tinypng.com/developers)

Once you have these keys, you will create two hidden files in your home directory, `.realfavicon` and `.tinypng`. Paste each API key into its respective file with no other content. You're all set!

## Required Back-end Utility (for Craft CMS)

#### BrightpackTwigExtensions.php 

```php
<?php

namespace Modules\TwigHelpers\TwigExtensions;

use Craft;
use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;

class BrightpackTwigExtensions extends AbstractExtension
{
    /**
     * @inheritdoc
     */
    public function getName()
    {
        return 'Brightpack';
    }

    /**
     * @inheritdoc
     */
    public function getFunctions()
    {
        return [
            new TwigFunction('entry', [$this, 'entry'], [
                'is_safe' => ['html']
            ]),
            new TwigFunction('asset', [$this, 'asset'], [
                'is_safe' => ['html']
            ]),
            new TwigFunction('external', [$this, 'external'], [
                'is_safe' => ['html']
            ])
        ];
    }

    /**
     * Returns versioned file(s) or the entire tag.
     *
     * @param  string     $file
     * @param  bool       $markup   (optional)
     * @param  bool       $manifest (optional)
     * @param  null|mixed $entry
     * @return string
     */
    public function entry($entry = null, $markup = true, $manifest = 'web/static/entries.json')
    {
        static $all;

        $results = [];
        $manifest_path = $this->join_path(CRAFT_BASE_PATH, $manifest);

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
                        is_array($markup) ? $this->attr($markup, ['media']) : ''
                    ) : $value;
                    break;

                case 'css' :
                    $result = $markup ? sprintf(
                        '<link href="%s" rel="stylesheet" %s>',
                        $value,
                        is_array($markup) ? $this->attr($markup) : ''
                    ) : $value;
                    break;
                default :
                    $result = '';
                    break;
            }

            $this->preload($value);

            $results[] = $result;
        }

        return $markup ? implode(PHP_EOL, $results) : $results;
    }

    /**
     * Returns versioned file(s) or the entire tag.
     *
     * @param  string     $file
     * @param  bool       $markup   (optional)
     * @param  bool       $manifest (optional)
     * @param  null|mixed $entry
     * @return string
     */
    public function asset($entry = null, $markup = true, $manifest = 'web/static/assets.json')
    {
        static $all;

        $manifest_path = $this->join_path(CRAFT_BASE_PATH, $manifest);

        if (!is_file($manifest_path)) {
            return $markup ? '' : [];
        }

        $all = $all ?: json_decode(file_get_contents($manifest_path), true);

        if (!$entry) {
            return $all;
        }

        if (isset($all[$entry])) {
            return $all[$entry];
        }

        return null;
    }

    public function external($path)
    {
        if (is_readable(Craft::getAlias($path))) {
            return file_get_contents(Craft::getAlias($path));
        }

        return '';
    }

    protected function preload($resource)
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
                header(sprintf('Link: <%s>; as=%s; rel=preload;', $this->url($r), $as), false);
                $pushed[] = $r;
            }
        }

        return $resource;
    }

    protected function attr($attributes = [], $except = [])
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

    protected function join_path(...$paths)
    {
        return preg_replace_callback('/([^:])\/+/', function ($matches) {
            return $matches[1] . '/';
        }, implode('/', (array) $paths));
    }

    protected function url($path = '')
    {
        $host = parse_url($path, PHP_URL_HOST);

        return trim($host ? $path : $this->join_path(sprintf(
            '%s://%s',
            ($this->is_https() ? 'https' : 'http'),
            $this->request('SERVER_NAME')
        ), $path), '/');
    }

    protected function is_https()
    {
        if ($this->request('HTTPS')) {
            if ('on' === strtolower($this->request('HTTPS'))) {
                return true;
            }
            if ('1' === $this->request('HTTPS')) {
                return true;
            }
        } elseif ($this->request('SERVER_PORT') && ('443' === $this->request('SERVER_PORT'))) {
            return true;
        }

        return false;
    }

    protected function request($only = null, $object = true)
    {
        $return = null;

        $request = array_merge($_GET, $_POST, $_SERVER);

        if ($only) {
            if (!is_array($only)) {
                $return = isset($request[$only]) ? $request[$only] : null;
            } else {
                $return = [];

                foreach ($only as $key) {
                    $value = isset($request[$key]) ? $request[$key] : null;

                    if ($value) {
                        $return[$key] = $value;
                    }
                }
            }
        } else {
            $return = !empty($request) ? $request : null;
        }

        if (!empty($return)) {
            return ($object && is_array($return)) ? (object) $return : $return;
        }
    }
}
```

#### Twig Usage

`entry()` will load a defined Webpack entry. The default entry setup in webpack.config.js is 'app'
```twig
<head>
    {{ entry('app') }}
</head>
```

`asset()` will output the hashed URL to an optimized asset.
```twig
<img src="{{ asset('img/photo.jpg') }}">
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

## Loaders

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

## Plugins

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
