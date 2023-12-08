const { EmbedBuilder } = require("discord.js");
const { useWorlds } = require("../bases/Worlds");
const { Fishes } = require("../lib/Fishes");

module.exports = class Command {

    constructor() {
        this.name = "world";
        this.category = "Information";
        this.description = "Get information about a world";
    }

    async run({ message, client }) {
        const { ErrorHandler } = client.params.get("utils");
        const { CategoryID } = client.params.get("storage").config;

        const errorHandler = new ErrorHandler(message);
        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));

        for (const world of worlds) {
            if (message.channel.id !== world.id) continue;
            
            const rewards = world.Fishes.map(fish => Fishes(message.guild.id, client)[fish]);

            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(world.name.toUpperCase());
            embed.setDescription(`*This is world number* ***${world.World.toLocaleString()}***\n*Minimum power is ${world.MinPower.toLocaleString()}*\n*Cooldown is* ***${world.cooldown ?? 0}*** *seconds*`);
            embed.addFields({ name: "Fishes", value: rewards.map(fish => `${fish.name} (${fish.chance}%) (Power: ${fish.power})\n- ${fish.description ?? "No Description"}`).join("\n") });

            return message.reply({ embeds: [embed] });
        }

        return errorHandler.error("You can only run this command in a World channel", `All World channels are located under the category <#${CategoryID.storage.get(message.guild.id)}>`, "Tip: type !worlds to get a list of worlds");
    }

}