const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { useWorlds } = require("../bases/Worlds");
const { v4 } = require("uuid");
const { Items } = require("../lib/Items");
const { Fishes } = require("../lib/Fishes");

module.exports = class Command {

    constructor() {
        this.name = "export";
        this.category = "Manage";
        this.description = "Export your current setup as a template";

        this.permissions = ["ManageGuild"];
    }

    async run({ message, client, args }) {
        const { ErrorHandler } = client.params.get("utils");
        const { config, core } = client.params.get("storage");
        const { CommunityTemplates } = core;
        const { CategoryID } = config;

        const handler = new ErrorHandler(message);

        if (!args.length) return handler.error("You didn't provide a name for the template", "Retry the command as follows: `!export Everfrost Fishing`", "Tip: !templates for a list of templates created by the community");
        
        CommunityTemplates.storage.ensure(message.author.id, []);

        const amount = CommunityTemplates.storage.get(message.author.id).length;
        if (amount >= 3) return handler.error("You already have 3 or more templates created", "The limit per account is 3 templates", "Use !delete 'Template ID' to delete a template");

        const query = args.join(" ").trim();
        if (!query.length) return handler.error("You didn't provide a name for the template", "Retry the command as follows: `!export Everfrost Fishing`", "Tip: !templates for a list of templates created by the community");

        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id)).map(world => {
            delete world.id;
            return world;
        })

        const data = {
            id: v4(),
            worlds,
            items: Items(message.guild.id, client),
            fishes: Fishes(message.guild.id, client),
            author: message.author.id,
            likes: 0,
            dislikes: 0,
            name: query
        }

        const embed = new EmbedBuilder();
        embed.setColor(process.env.HEX);
        embed.setTitle(`Your template has been exported - ${query}`);
        embed.setDescription("*Use !templates to view all community-made templates*");

        const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(data, undefined, 4)), { name: "template.json" });
        message.reply({ embeds: [embed], files: [attachment] });

        CommunityTemplates.storage.push(message.author.id, data);
    }

}