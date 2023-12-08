const { EmbedBuilder } = require("discord.js");
const { Fishes } = require("../lib/Fishes");

module.exports = class Command {

    constructor() {
        this.name = "bag";
        this.category = "Information";
        this.description = "Get a list of all your collected fish";

        this.alias = ["fishes"];
    }

    async run({ message, client }) {
        const { Pagination, Mathf } = client.params.get("utils");
        const { Bag } = client.params.get("storage").player;

        const user = message.mentions.users.first() ?? message.author;

        const page = new Pagination(message);

        const bag = Bag.storage.get(`${message.guild.id}-${user.id}`);
        const chunks = Mathf.chunks(bag.filter((fish,
            index) => bag.indexOf(fish) === index), 5);

        if (!chunks.length) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Fishes - ${Bag.storage.get(user.id).length.toLocaleString()}`);
            embed.setDescription(`*Don't see what you're looking for? try !help*`);
            embed.addFields({ name: `${user.username} does not have any fishes`, value: "Start fishing with !fish" });

            return message.reply({ embeds: [embed] });
        }

        for (const chunk of chunks) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Fishes - ${Bag.storage.get(`${message.guild.id}-${user.id}`).length.toLocaleString()}`);
            embed.setDescription(`*Don't see what you're looking for? try !help*`);

            if (!chunk.length) {
                embed.addFields({ name: `${user.username} does not have any fishes`, value: "Start mining with !fish" });
            }

            for (const Fish of chunk) {
                const fish = Fishes[Fish];

                embed.addFields({
                    name: `${fish.name} x${Bag.storage.get(`${message.guild.id}-${user.id}`).filter(FISH  => FISH === fish.id).length}`,
                    value: fish.description ?? "No Description",
                })
            }

            page.add(embed);
        }

        return await page.run();
    }

}