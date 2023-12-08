const { EmbedBuilder } = require("discord.js");
const { Fishes } = require("../lib/Fishes");

module.exports = class Command {

    constructor() {
        this.name = "registry";
        this.category = "Information";
        this.description = "Get a list of all fishes that you've fished";
    }

    async run({ message, client }) {
        const { Pagination, Mathf } = client.params.get("utils");
        const { Registry } = client.params.get("storage").player;

        const user = message.mentions.users.first() ?? message.author;

        const page = new Pagination(message);
        const chunks = Mathf.chunks(Registry.storage.get(`${message.guild.id}-${user.id}`), 5);

        if (!chunks.length) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Registry - ${Registry.storage.get(`${message.guild.id}-${user.id}`).length.toLocaleString()}`);
            embed.setDescription(`*Doesn't seem like ${user.username} has fished anything*`);
            embed.setFooter({ text: "Tip: Run !fish in a world channel to start gaining fishes" });

            return message.reply({ embeds: [embed] });
        }

        for (const chunk of chunks) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Registry - ${Registry.storage.get(`${message.guild.id}-${user.id}`).length.toLocaleString()}`);
            embed.setDescription(`*Registry is what's used to update you to a higher rank*`);

            for (const Fish of chunk) {
                const fish = Fishes[Fish]

                embed.addFields({
                    name: `${fish.name}`,
                    value: fish.description ?? "No Description",
                })
            }

            page.add(embed);
        }

        return await page.run();
    }

}