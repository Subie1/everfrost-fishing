const yaml = require("yaml");

module.exports.useWorlds = function(client, server, category) {
    const guild = client.guilds.cache.get(server);
    const worlds = guild.channels.cache.get(category);

    const WORLDS = worlds.children.cache.map(world => {
        const raw = yaml.parse(world.topic);
        const parsed = {
            World: raw.World,
            cooldown: raw.Cooldown,
            Fishes: raw.Fishes,
            MinPower: raw["Minimum Power"],
            Rank: raw.Rank,
        }

        const data = {
            name: world.name,
            ...parsed,
            id: world.id,
        };

        return data;
    })

    WORLDS.sort((a, b) => {
        if (a.World > b.World) return 1;
        if (a.World < b.World) return -1;
        
        return 0;
    })

    return WORLDS;
}