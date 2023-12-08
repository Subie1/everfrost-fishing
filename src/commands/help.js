const { EmbedBuilder } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "help";
        this.category = "Information";
        this.description = "Get a help menu";

        this.alias = ["h"];
    }

    async run({ message, args, client }) {
        const { commands, alias } = client.params.get("command_handler");
        const { Pagination, Mathf } = client.params.get("utils");

        condition: if (args.length) {
            if (!commands.has(args[0].toLowerCase()) && !alias.has(args[0].toLowerCase())) break condition;

            const command = commands.get(args[0].toLowerCase()) ?? alias.get(args[0].toLowerCase());

            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`${command.name.toUpperCase()}`);
            embed.setDescription(`*${command.description ?? "No Description"}*`);
            embed.addFields({ name: "CATEGORY", value: command.category });
            
            if (command.alias) embed.addFields({ name: "ALIAS", value: `- ${command.alias.map(a => `**${a}**`).join(" | ")}` });

            return message.reply({ embeds: [embed] });
        }

        const page = new Pagination(message);
        const categories = {};

        for (const command of Array.from(commands.values())) {
            if (command.hidden) continue;
            if (!categories[command.category]) {
                categories[command.category] = [command];
                continue;
            }
            categories[command.category].push(command);
        }

        const chunks = Mathf.chunks(Object.keys(categories), 5);

        for (const chunk of chunks) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`Commands - ${Array.from(commands.values()).filter(c => !c.hidden).length.toLocaleString()}`);
            embed.setDescription(`📢 Type !help <command> for more info - (Use !setup for more info)`);

            for (const category of chunk) {
                embed.addFields({
                    name: `${category} - ${categories[category].length.toLocaleString()}`,
                    value: categories[category].map(command => `\`${command.name}\``).join(" | "),
                })
            }

            page.add(embed);
        }

        return await page.run();
    }

}