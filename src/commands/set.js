const { EmbedBuilder } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "set";
        this.category = "Manage";
        this.description = "Modify certain config settings";

        this.permissions = ["ManageGuild"];
    }

    async run({ message, client, args }) {
        const { Mathf } = client.params.get("utils");
        const { config } = client.params.get("storage");
        
        const keys = Object.keys(config);
        condition: if (args.length) {
            const query = args.shift();
            if (!keys.includes(query)) break condition;
            
            const params = args.join(" ").trim();

            if (!params.length) break condition;
            if (query.includes("ID") && !message.guild.channels.cache.has(params)) break condition;

            config[query].storage.set(message.guild.id, params);
        }

        const embed = new EmbedBuilder();
        embed.setColor(process.env.HEX);
        embed.setTitle("List of configurable settings");
        embed.setDescription("*Beware with modifying these, it can break alot of things*");
        
        for (const key of keys) {
            embed.addFields({ name: Mathf.capitalize(key), value: `\`'${config[key].storage.get(message.guild.id)}'\`` });
        }

        return message.reply({ embeds: [embed] });
    }

}