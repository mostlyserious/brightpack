module.exports = function chunkName(length) {
    return (module, chunks, cacheGroupKey) => {
        const allChunksNames = chunks.map(item => item.name ? item.name.substring(0, length) : item.name);

        return `${cacheGroupKey}.${allChunksNames.join('~')}`;
    };
};
