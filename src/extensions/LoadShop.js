const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Items, TYPES } = require("../lib/Items");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class Storage {

    constructor(client) {
        this.name = "Load Shop";

        client.on("interactionCreate", async i => {
            if (!i.isButton()) return;

            const { player } = client.params.get("storage");
            const { Coins, Inventory, Equipped } = player;

            for (const data in player) {
                const container = player[data];
                if (container instanceof Map) continue;
                container.storage.ensure(`${i.guild.id}-${i.user.id}`, container.default);
            }

            const Item = Items(i.guild.id, client)[i.customId];

            if (!Item) return;
            if (!Item.price) return i.reply({ content: "Failed to purchase, try again later!", ephemeral: true });
            if (Inventory.storage.includes(`${i.guild.id}-${i.user.id}`, Item.id) && Item.type === TYPES.Rod) return i.reply({ content: "You have already purchased this item", ephemeral: true });

            const coins = Coins.storage.get(`${i.guild.id}-${i.user.id}`);
            if (coins < Item.price) return i.reply({ content: "You do not have enough coins to purchase this item", ephemeral: true });

            Inventory.storage.push(`${i.guild.id}-${i.user.id}`, Item.id);
            Coins.storage.math(`${i.guild.id}-${i.user.id}`, "-", Item.price);

            if (Item.type === TYPES.Rod) Equipped.storage.set(`${i.guild.id}-${i.user.id}`, Item.id);

            await i.reply({ content: "You purchased the item", ephemeral: true });
            if (Item.OnPurchase) Item.OnPurchase(i, client);
        })

        client.once("ready", async () => {
            for (const guild of client.guilds.cache.values()) {
                const { ShopID } = client.params.get("storage").config;
                const { Shop } = client.params.get("storage").server;
                await Shop.storage.fetchEverything();
                
                ShopID.storage.ensure(guild.id, "");
                if (!ShopID.storage.get(guild.id).trim().length) continue;

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
        })
    }

}