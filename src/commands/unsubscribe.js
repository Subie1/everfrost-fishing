const { EmbedBuilder } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "unsubscribe";
        this.category = "Manage";
        this.description = "UnSubscribe to a template from your library";
    }

    async run({ message, client, args }) {
        const { SubscribedTemplates } = client.params.get("storage").player;
        const { CommunityTemplates } = client.params.get("storage").core;
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        SubscribedTemplates.storage.ensure(message.author.id, []);
        await CommunityTemplates.storage.fetchEverything();

        if (!args.length) return handler.error("No ID was provided", "Use `'!library'` to find an ID to unsubscribe to", "Tip: Use `'!subscribe default'` for the default template");

        const query = args[0].toLowerCase() == "default" ? process.env.DEFAULT_TEMPLATE : args[0].toLowerCase();

        const templates = SubscribedTemplates.storage.get(message.author.id);
        const template = templates.find((template) => template.id == query);

        if (!template) return handler.error("Invalid template ID", `A template with the id \`${query}\` was not found`, "Use `'!library'` for a list of subscribed templates");

        SubscribedTemplates.storage.remove(message.author.id, (t) => t.id === template.id);
        const author = await client.users.fetch(template.author);

        const embed = new EmbedBuilder();
        embed.setColor(process.env.HEX);
        embed.setTitle(`Unsubscribed to \`${template.name}\``);
        embed.setDescription(`You have unsubscribed to a template by *@${author ? author.username : "Anonymous"}*`);

        return message.reply({ embeds: [embed] });
    }

}