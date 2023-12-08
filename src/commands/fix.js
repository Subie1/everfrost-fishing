const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { useWorlds } = require("../bases/Worlds");
const { Items, TYPES } = require("../lib/Items");
const { RANKS } = require("../lib/Ranks");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class Command {

    constructor() {
        this.name = "fix";
        this.category = "Manage";
        this.description = "Fix every world permissions and create roles";

        this.permissions = ["ManageGuild"];
    }

    async run({ message, client }) {
        message.delete();
        
        const { CategoryID } = client.params.get("storage").config;
        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));

        for (const world of worlds) {
            const channel = message.guild.channels.cache.get(world.id);

            if (!RANKS(worlds)[world.World]) continue;

            const RoleExists = message.guild.roles.cache.some(role => role.name === `Rank ${RANKS(worlds)[world.World]}`);
            if (RoleExists) continue;

            const role = await message.guild.roles.create({ name: `Rank ${RANKS(worlds)[world.World]}` });

            channel.permissionOverwrites.create(message.guild.id, { ViewChannel: false });
            channel.permissionOverwrites.create(role.id, { ViewChannel: true, SendMessages: true });
        }

        const { ShopID } = client.params.get("storage").config;
        const { Shop } = client.params.get("storage").server;
        await Shop.storage.fetchEverything();

        const guild = message.guild;
        ShopID.storage.ensure(guild.id, "");
        if (!ShopID.storage.get(guild.id).trim().length) return;

        const channel = guild.channels.cache.get(ShopID.storage.get(guild.id));
        Shop.storage.ensure(guild.id, []);

        for (const Item of Object.values(Items(guild.id, client))) {
            if (!Item.price) continue;

            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`${Item.name} - ${Item.price.toLocaleString()} snowflakes`);
            embed.setDescription(Item.description ?? "No Description");
            embed.addFields({ name: "Type", value: Object.keys(TYPES).filter(key => TYPES[key] === Item.type)[0] });

            if (Item.break) embed.addFields({ name: "Power", value: `${Item.power}` });

            condition: if (Shop.storage.get(guild.id).find((i) => i.id === Item.id)) {
                try {
                    const result = Shop.storage.get(guild.id).find((i) => i.id === Item.id);
                    const message = await channel.messages.fetch(result.message);
                    message.edit({ embeds: [embed] });

                    await wait(1000);
                    continue;
                } catch (err) {
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

}