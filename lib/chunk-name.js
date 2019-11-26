module.exports = function chunkName(module, chunks, cacheGroupKey) {
    const allChunksNames = chunks.map(item => item.name ? item.name.substring(0, 3) : item.name);

    return `${cacheGroupKey}.${allChunksNames.join('~')}`;
};
