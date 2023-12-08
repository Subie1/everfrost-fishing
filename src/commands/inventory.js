const { EmbedBuilder } = require("discord.js");
const { Items } = require("../lib/Items");
const { RANKS } = require("../lib/Ranks");
const { useWorlds } = require("../bases/Worlds");

module.exports = class Command {

    constructor() {
        this.name = "inventory";
        this.category = "Information";
        this.description = "Get a list of all your items";

        this.alias = ["items", "inv", "i", "profile"];
    }

    async run({ message, client }) {
        const { Pagination, Mathf } = client.params.get("utils");
        const { Inventory, Rank, Coins, Equipped } = client.params.get("storage").player;

        const { CategoryID } = client.params.get("storage").config;
        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));

        const user = message.mentions.users.first() ?? message.author;
        const equipped = Equipped.storage.get(`${message.guild.id}-${user.id}`);

        const page = new Pagination(message);
        const chunks = Mathf.chunks(Inventory.storage.get(`${message.guild.id}-${user.id}`), 5);

        if (!chunks.length) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Items - ${Inventory.storage.get(`${message.guild.id}-${user.id}`).length.toLocaleString()}`);
            embed.setDescription(`*Don't see what you're looking for? try !help*`);
            embed.addFields({ name: `${user.username} does not have any items`, value: "But how have you done that?" });

            return message.reply({ embeds: [embed] });
        }

        for (const chunk of chunks) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Items - ${Inventory.storage.get(`${message.guild.id}-${user.id}`).length.toLocaleString()}`);
            embed.setDescription(`Coins: ${Coins.storage.get(`${message.guild.id}-${user.id}`).toLocaleString()}\nRank: ${RANKS(worlds)[Rank.storage.get(`${message.guild.id}-${user.id}`)]}`);

            if (!chunk.length) {
                embed.addFields({ name: `${user.username} does not have any items`, value: "But how have you done that?" });
            }

            for (const Item of chunk) {
                const item = Items(message.guild.id, client)[Item];

                if (!item) {
                    embed.addFields({
                        name: "Corrupted??????",
                        value: "You have a very interesting slot right now",
                    });

                    continue;
                }

                embed.addFields({
                    name: `${item.id === equipped ? "✅ " : ""}${item.name}`,
                    value: item.description ?? "No Description",
                })
            }

            page.add(embed);
        }

        return await page.run();
    }

}