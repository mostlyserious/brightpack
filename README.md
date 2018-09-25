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
        editor: path.resolve('src/js/editor.js'),
        appearance: path.resolve('src/js/appearance.js'),
        gform: path.resolve('src/sass/gform.scss'),
        login: path.resolve('src/sass/login.scss'),
        wp: path.resolve('src/sass/wp.scss')
    };

    config.externals.jquery = 'jQuery';

    return config;
});
```
