module.exports.RANKS = (worlds) => {
    const data = [];

    for (const world of worlds) {
        data.push(world.Rank);
    }

    return data;
}