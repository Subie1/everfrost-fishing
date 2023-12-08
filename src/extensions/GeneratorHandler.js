const yaml = require("yaml");
const { useWorlds } = require("../bases/Worlds");
const { ChannelType } = require("discord.js");
const { RANKS } = require("../lib/Ranks");
const { TYPES } = require("../lib/Items");

module.exports = class GeneratorHandler {

    constructor(client) {
        this.name = "Generator Handler";

        client.on("interactionCreate", async i => {
            if (!i.isModalSubmit()) return;
            if (!i.customId.startsWith("modal_")) return;

            const { CategoryID } = client.params.get("storage").config;
            const { ServerItems } = client.params.get("storage").server;
            const worlds = useWorlds(client, i.guild.id, CategoryID.storage.get(i.guild.id));

            const action = i.customId.slice("modal_".length);

            if (action == "world_generation") {
                const name = i.fields.getTextInputValue("info_name").trim();
                const rank = i.fields.getTextInputValue("info_rank").trim();
                const cooldown = i.fields.getTextInputValue("info_cooldown").trim();
                const minPower = i.fields.getTextInputValue("info_min_power").trim();
                const fishes = i.fields.getTextInputValue("info_fishes").trim();
                const worldIndex = worlds.length;

                if (!name.length) return i.reply("World name mustn't be empty");
                if (!rank.length) return i.reply("World rank mustn't be empty");
                if (!fishes.length) return i.reply("World fishes mustn't be empty");
                if (isNaN(cooldown)) return i.reply("The cooldown must be a number");
                if (isNaN(minPower)) return i.reply("The minimum power must be a number");

                const data = {
                    World: worldIndex,
                    Cooldown: parseInt(cooldown),
                    Fishes: yaml.parse(fishes),
                    "Minimum Power": parseInt(minPower),
                    Rank: rank
                }

                await i.guild.channels.create({ name, type: ChannelType.GuildText, parent: CategoryID.storage.get(i.guild.id), topic: yaml.stringify(data) });

                const rerenderedWorlds = useWorlds(client, i.guild.id, CategoryID.storage.get(i.guild.id));

                for (const world of rerenderedWorlds) {
                    if (world.World === 0) continue;
                    if (!RANKS(worlds)[world.World]) continue;

                    const RoleExists = i.guild.roles.cache.some(role => role.name === `Rank ${RANKS(worlds)[world.World]}`);
                    if (RoleExists) continue;

                    const role = await i.guild.roles.create({ name: `Rank ${RANKS(worlds)[world.World]}` });
                    const channel = i.guild.channels.cache.get(world.id);

                    await channel.permissionOverwrites.create(i.guild.id, { ViewChannel: false });
                    await channel.permissionOverwrites.create(role.id, { ViewChannel: true, SendMessages: true });
                }

                await i.reply("Generated the world successfully");
            }

            if (action == "item_generation") {
                const name = i.fields.getTextInputValue("info_name").trim();
                const description = i.fields.getTextInputValue("info_description").trim();
                const power = i.fields.getTextInputValue("info_power").trim();
                const price = i.fields.getTextInputValue("info_price").trim();

                if (!name.length) return i.reply("World name mustn't be empty");
                if (isNaN(power)) return i.reply("The power must be a number");
                if (price && isNaN(price)) return i.reply("The price must be a number");

                const data = {
                    name,
                    type: TYPES.Rod,
                    description: description ? description.length ? description : "No Description" : "No Description",
                    power,
                    id: name.toLowerCase().replace(/ /g, "_"),
                }

                if (price) data["price"] = parseInt(price);
                ServerItems.storage.ensure(i.guild.id, ServerItems.default);
                ServerItems.storage.set(i.guild.id, data, name.toLowerCase().replace(/ /g, "_"));

                await i.reply("Generated the item successfully");
            }
        })
    }

}