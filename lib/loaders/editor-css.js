const css = require('./css');
const use = [...css.use];

use[0] = {
    loader: 'style-loader',
    options: {
        insertInto: function() {
            const iframe = document.querySelector('#content_ifr');

            return (iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document).head;
        }
    }
};

module.exports = { test: /editor\.css$/, use };
