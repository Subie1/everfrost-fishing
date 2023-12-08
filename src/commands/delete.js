const { EmbedBuilder } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "delete";
        this.category = "Manage";
        this.description = "Delete a template you added to Community-Library";
    }

    async run({ message, client, args }) {
        const { CommunityTemplates } = client.params.get("storage").core;
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        CommunityTemplates.storage.ensure(message.author.id, []);
        await CommunityTemplates.storage.fetchEverything();

        if (!args.length) return handler.error("No ID was provided", "Use `'!templates'` to get a list of templates", "Tip: Use `'!delete ID'` to delete a template");

        const query = args[0].toLowerCase() == "default" ? process.env.DEFAULT_TEMPLATE : args[0].toLowerCase();

        const templates = CommunityTemplates.storage.get(message.author.id);
        const template = templates.find((template) => template.id == query);

        if (!template) return handler.error("Invalid template ID", `A template with the id \`${query}\` was not found`, "Use `'!templates'` for a list of community templates");
        CommunityTemplates.storage.remove(message.author.id, (t) => t.id === template.id);

        const embed = new EmbedBuilder();
        embed.setColor(process.env.HEX);
        embed.setTitle(`Deleted \`${template.name}\``);
        embed.setDescription(`You have deleted a template`);

        return message.reply({ embeds: [embed] });
    }

}