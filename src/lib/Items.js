module.exports.TYPES = {
    Rod: 0,
    Loot: 1,
    Pet: 2,
    Egg: 3,
}

const Items = (guild, client) => {
    const { ServerItems } = client.params.get("storage").server;
    ServerItems.storage.ensure(guild, ServerItems.default);

    return ServerItems.storage.get(guild);
}

module.exports.Items = Items;