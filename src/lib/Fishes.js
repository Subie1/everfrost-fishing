const Fishes = (guild, client) => {
    const { ServerFishes } = client.params.get("storage").server;
    ServerFishes.storage.ensure(guild, ServerFishes.default);

    return ServerFishes.storage.get(guild);
}

module.exports.Fishes = Fishes;