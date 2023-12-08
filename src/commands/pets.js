const { EmbedBuilder } = require("discord.js");
const { Pets: PetData } = require("../lib/Pets");

module.exports = class Command {

    constructor() {
        this.name = "pets";
        this.category = "Information";
        this.description = "Get a list of all your pets";

        this.alias = ["stable"];
    }

    async run({ message, client }) {
        const { Pagination, Mathf } = client.params.get("utils");
        const { Pets } = client.params.get("storage").player;

        const user = message.mentions.users.first() ?? message.author;

        const page = new Pagination(message);
        const chunks = Mathf.chunks(Pets.storage.get(`${message.guild.id}-${user.id}`), 5);

        if (!chunks.length) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Pets - ${Pets.storage.get(`${message.guild.id}-${user.id}`).length.toLocaleString()}`);
            embed.setDescription(`*Don't see what you're looking for? try !help*`);
            embed.addFields({ name: `${user.username} does not have any pets`, value: "But how have you done that?" });

            return message.reply({ embeds: [embed] });
        }

        for (const chunk of chunks) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Pets - ${Pets.storage.get(`${message.guild.id}-${user.id}`).length.toLocaleString()}`);
            embed.setDescription(`*Don't see what you're looking for? try !help*`);

            if (!chunk.length) {
                embed.addFields({ name: `${user.username} does not have any pets`, value: "But how have you done that?" });
            }

            for (const Pet of chunk) {
                const pet = PetData[Pet];
                
                if (!pet) {
                    embed.addFields({
                        name: "Corrupted??????",
                        value: "You have a very interesting slot right now",
                    });

                    continue;
                }

                embed.addFields({
                    name: `${pet.name}`,
                    value: pet.description ?? "No Description",
                })
            }

            page.add(embed);
        }

        return await page.run();
    }

}