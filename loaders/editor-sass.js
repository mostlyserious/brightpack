const sass = require('./sass');

module.exports = config => {
    const use = [...sass(config).use];

    use[0] = {
        loader: 'style-loader',
        options: {
            insertInto: function() {
                const iframe = document.querySelector('#content_ifr');

                return (iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document).head;
            }
        }
    };

    return { test: /editor\.s[ac]ss$/, use };
};
