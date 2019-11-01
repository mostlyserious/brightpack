module.exports = function chunkName(module, chunks, cacheGroupKey) {
    const allChunksNames = chunks.map(item => item.name.substring(0, 3));

    return `${cacheGroupKey}.${allChunksNames.join('~')}`;
};
