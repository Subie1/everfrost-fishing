/* eslint-disable no-useless-escape */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { useWorlds } = require("./Worlds");
const { Pets } = require("../lib/Pets");
const { Eggs } = require("../lib/Eggs");

module.exports.useWorldsShop = async function(client, server, category) {
    const worlds = useWorlds(client, server, category);
    const { EggShop } = client.params.get("storage").server;

    const guild = client.guilds.cache.get(server);
    
    for (const world of worlds) {
        if (!world.Eggs) continue;
        const channel = guild.channels.cache.get(world.id);

        for (const Egg of world.Eggs) {
            const egg = Eggs[Egg];

            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`${egg.name} ($${egg.price.toLocaleString()})`);
            embed.setDescription(`*${egg.description ?? "No Description"}*`);

            const row = new ActionRowBuilder();
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${egg.id}`)
                    .setLabel("Purchase")
                    .setStyle(ButtonStyle.Primary)
            )

            for (const Pet of egg.pets) {
                if (!Pets[Pet]) continue;
                const pet = Pets[Pet];

                embed.addFields({ name: `${pet.name} (${pet.chance}%)`, value: `- *${pet.description}*` ?? "- *No Description*" });
            }

            if (!EggShop.storage.has(world.id)) {
                const message = await channel.send({ embeds: [embed], components: [row] });
                await message.pin();

                EggShop.storage.set(world.id, [message.id]);
                return;
            }

            for (const MessageID of EggShop.storage.get(world.id)) {
                const message = await channel.messages.fetch(MessageID);
                if (message) message.edit({ embeds: [embed], components: [row] });
            }
        }
    }
}