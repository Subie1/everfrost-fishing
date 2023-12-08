const yaml = require("yaml");
const { useWorlds } = require("../bases/Worlds");
const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { RANKS } = require("../lib/Ranks");
const { TYPES, Items } = require("../lib/Items");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class GeneratorHandler {

    constructor(client) {
        this.name = "Generator Handler";

        client.on("interactionCreate", async i => {
            if (!i.isModalSubmit()) return;
            if (!i.customId.startsWith("modal_")) return;

            const { CategoryID } = client.params.get("storage").config;
            const { ServerItems, ServerFishes } = client.params.get("storage").server;
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
                await i.reply("Generated the world successfully");

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
            }

            if (action == "item_generation") {
                const name = i.fields.getTextInputValue("info_name").trim();
                const description = i.fields.getTextInputValue("info_description").trim();
                const power = i.fields.getTextInputValue("info_power").trim();
                const price = i.fields.getTextInputValue("info_price").trim();

                if (!name.length) return i.reply("World name mustn't be empty");
                if (isNaN(power)) return i.reply("The power must be a number");
                if (price && isNaN(price)) return i.reply("The price must be a number");
                await i.reply("Generated the item successfully");

                const data = {
                    name,
                    type: TYPES.Rod,
                    description: description ? description.length ? description : "No Description" : "No Description",
                    power: parseInt(power),
                    id: name.toLowerCase().replace(/ /g, "_"),
                }

                if (price) data["price"] = parseInt(price);
                ServerItems.storage.ensure(i.guild.id, ServerItems.default);
                ServerItems.storage.set(i.guild.id, data, name.toLowerCase().replace(/ /g, "_"));

                const guild = i.guild;

                const { ShopID } = client.params.get("storage").config;
                const { Shop } = client.params.get("storage").server;
                await Shop.storage.fetchEverything();

                ShopID.storage.ensure(guild.id, "");
                if (!ShopID.storage.get(guild.id).trim().length) return;

                Shop.storage.ensure(guild.id, []);

                for (const Item of Object.values(Items(guild.id, client))) {
                    if (!Item.price) continue;

                    const embed = new EmbedBuilder();
                    embed.setColor(process.env.HEX);
                    embed.setTitle(`${Item.name} - ${Item.price.toLocaleString()} snowflakes`);
                    embed.setDescription(Item.description ?? "No Description");
                    embed.addFields({ name: "Type", value: Object.keys(TYPES).filter(key => TYPES[key] === Item.type)[0] });

                    if (Item.power) embed.addFields({ name: "Power", value: `${Item.power}` });

                    const channel = guild.channels.cache.get(ShopID.storage.get(guild.id));

                    condition: if (Shop.storage.get(guild.id).find((i) => i.id === Item.id)) {
                        try {
                            const result = Shop.storage.get(guild.id).find((i) => i.id === Item.id);
                            const message = await channel.messages.fetch(result.message);
                            message.edit({ embeds: [embed] });

                            await wait(1000);
                            continue;
                        } catch (err) {
                            Shop.storage.remove(guild.id, (i) => i.id === Item.id);
                            break condition;
                        }
                    }

                    const row = new ActionRowBuilder();
                    row.addComponents(
                        new ButtonBuilder()
                            .setLabel("Purchase")
                            .setCustomId(Item.id)
                            .setStyle(ButtonStyle.Success),
                    )

                    const message = await channel.send({ embeds: [embed], components: [row] });
                    Shop.storage.push(guild.id, { id: Item.id, message: message.id });

                    await wait(1000);
                }
            }

            if (action == "fish_generation") {
                const name = i.fields.getTextInputValue("info_name").trim();
                const description = i.fields.getTextInputValue("info_description").trim();
                const sell = i.fields.getTextInputValue("info_sell").trim();
                const chance = i.fields.getTextInputValue("info_chance").trim();
                const power = i.fields.getTextInputValue("info_power").trim();

                if (!name.length) return i.reply("World name mustn't be empty");
                if (isNaN(power)) return i.reply("The power must be a number");
                if (isNaN(chance)) return i.reply("The chance must be a number");
                if (isNaN(sell)) return i.reply("The sell must be a number");
                await i.reply("Generated the fish successfully");

                const data = {
                    name,
                    description: description ? description.length ? description : "No Description" : "No Description",
                    power: parseInt(power),
                    sell: parseInt(sell),
                    chance: parseInt(chance),
                    id: name.toLowerCase().replace(/ /g, "_"),
                }

                ServerFishes.storage.ensure(i.guild.id, ServerFishes.default);
                ServerFishes.storage.set(i.guild.id, data, name.toLowerCase().replace(/ /g, "_"));
            }
        })
    }

}