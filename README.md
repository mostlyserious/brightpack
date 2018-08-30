##### webpack.config.js

```js
let path = require('path'),
    glob = require('tiny-glob'),
    extend = require('brightpack');

const dest = 'assets';
const watch = ['theme/**/*', '*.php'];
const publicPath = path.join('/wp-content/themes', path.basename(__dirname), dest, '/');

module.exports = extend(dest, publicPath, watch, async config => {
    config.entry = {
        app: [
            path.resolve('src/js/main'),
            path.resolve('src/sass/main.scss'),
            ...(await glob('src/{img,favicon}/**.*')).map(f => path.resolve(f))
        ],
        dashboard: [
            path.resolve('src/js/admin'),
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
