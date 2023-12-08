const { EmbedBuilder } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "subscribe";
        this.category = "Manage";
        this.description = "Subscribe to a community-made template";
    }

    async run({ message, client, args }) {
        const { SubscribedTemplates } = client.params.get("storage").player;
        const { CommunityTemplates } = client.params.get("storage").core;
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        SubscribedTemplates.storage.ensure(message.author.id, []);
        await CommunityTemplates.storage.fetchEverything();
        
        if (!args.length) return handler.error("No ID was provided", "Use `'!templates'` to find an ID to subscribe to", "Tip: Use `'!subscribe default'` for the default template");

        const query = args[0].toLowerCase() == "default" ? process.env.DEFAULT_TEMPLATE : args[0].toLowerCase();

        const templates = Array.from(...CommunityTemplates.storage.values());
        const template = templates.find((template) => template.id == query);

        if (!template) return handler.error("Invalid template ID", `A template with the id \`${query}\` was not found`, "Use `'!templates'` for a list of community-made templates");
        if (SubscribedTemplates.storage.get(message.author.id).find((t) => t.id == template.id)) return handler.error("You already subscribed to this template", "Try using `'!unsubscribe ID'` to unsubscribe to the template", "Use '!library' for a list of subscribed templates")

        SubscribedTemplates.storage.push(message.author.id, template);
        const author = await client.users.fetch(template.author);

        const embed = new EmbedBuilder();
        embed.setColor(process.env.HEX);
        embed.setTitle(`Subscribed to \`${template.name}\``);
        embed.setDescription(`You have subscribed to a template by *@${author ? author.username : "Anonymous"}*`);
        embed.addFields({ name: "HOW TO USE", value: "- Use `'!load ID'` to load a subscribed template" });
        embed.addFields({ name: "UNSUBSCRIBING", value: "- It's as easy as using `'!unsubscribe ID'`" });

        return message.reply({ embeds: [embed] });
    }

}