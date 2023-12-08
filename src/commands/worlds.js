const { EmbedBuilder } = require("discord.js");
const { useWorlds } = require("../bases/Worlds");
const { Fishes } = require("../lib/Fishes");

module.exports = class Command {

    constructor() {
        this.name = "worlds";
        this.category = "Information";
        this.description = "Get information about all worlds";
    }

    async run({ message, client }) {
        const { Pagination } = client.params.get("utils");
        
        const { CategoryID } = client.params.get("storage").config;
        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));

        const page = new Pagination(message);

        for (const world of worlds) {
            const rewards = world.Fishes.map(fish => Fishes(message.guild.id, client)[fish]);

            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`${world.name.toUpperCase().replace(/-/g, " ")} - <#${world.id}>`);
            embed.setDescription(`*This is world number* ***${world.World.toLocaleString()}***\n*Minimum power is ${world.MinPower.toLocaleString()}*\n*Cooldown is* ***${world.cooldown ?? 0}*** *seconds*`);
            embed.addFields({ name: "Fishes", value: rewards.map(fish => `${fish.name} (${fish.chance}%) (Power: ${fish.power})\n- ${fish.description ?? "No Description"}`).join("\n") });

            page.add(embed);
        }

        return page.run();
    }

}