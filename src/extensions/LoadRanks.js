const { useWorlds } = require("../bases/Worlds");
const { RANKS } = require("../lib/Ranks");

function areEqual(array1, array2) {
    return array1.filter(i => !array2.includes(i)).length === 0;
}

module.exports = class Storage {

    constructor(client) {
        this.name = "Load Ranks";

        client.on("messageCreate", async message => {
            if (message.author.bot) return;
            if (!message.guild) return;

            const { player } = client.params.get("storage");
            const { Rank, Registry } = player;

            for (const data in player) {
                const container = player[data];
                if (container instanceof Map) continue;
                container.storage.ensure(`${message.guild.id}-${message.author.id}`, container.default);
            }

            const { CategoryID } = client.params.get("storage").config;

            CategoryID.storage.ensure(message.guild.id, "");

            if (!CategoryID.storage.get(message.guild.id).trim().length) return;
            const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));
            
            const world = worlds.filter(w => w.World === Rank.storage.get(`${message.guild.id}-${message.author.id}`))[0];

            if (world) {
                if (areEqual(world.Fishes, Registry.storage.get(`${message.guild.id}-${message.author.id}`))) {
                    Rank.storage.math(`${message.guild.id}-${message.author.id}`, "add", 1);
                    message.channel.send(`<@${message.author.id}> Congrats, You unlocked a new world!`);
                }
            }

            const rank = Rank.storage.get(`${message.guild.id}-${message.author.id}`);

            if (!RANKS(worlds)[rank]) return;

            const HasRole = message.member.roles.cache.some(role => role.name === `Rank ${RANKS(worlds)[rank]}`);
            const RoleExists = message.guild.roles.cache.some(role => role.name === `Rank ${RANKS(worlds)[rank]}`);

            if (!RoleExists) await message.guild.roles.create({ name: `Rank ${RANKS(worlds)[rank]}` });
            if (HasRole) return;

            const role = message.guild.roles.cache.find(role => role.name === `Rank ${RANKS(worlds)[rank]}`);
            message.member.roles.add(role);
        })
    }

}