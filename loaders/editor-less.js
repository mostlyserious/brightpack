const less = require('./less');

module.exports = config => {
    const use = [...less(config).use];

    use[0] = {
        loader: 'style-loader',
        options: {
            insertInto: function() {
                const iframe = document.querySelector('#content_ifr');

                return (iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document).head;
            }
        }
    };

    return { test: /editor\.less$/, use };
};
