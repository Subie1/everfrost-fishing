const { EmbedBuilder } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "templates";
        this.category = "Manage";
        this.description = "Check out all the available community-made templates";

        this.alias = ["community"];
    }

    async run({ message, client }) {
        const { Pagination, Mathf } = client.params.get("utils");
        const { CommunityTemplates } = client.params.get("storage").core;

        await CommunityTemplates.storage.fetchEverything();

        const chunks = Mathf.chunks(Array.from(...CommunityTemplates.storage.values()), 10);
        const page = new Pagination(message);

        for (const chunk of chunks) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle("Community Library");
            embed.setDescription("For the default template use `'!subscribe default'`");

            for (const template of chunk) {
                const author = await client.users.fetch(template.author);
                embed.addFields({ name: `- ${template.name} (*@${author ? author.username : "Anonymous"}*)`, value: `\`${template.id}\`\n👍 ${template.likes} 👎 ${template.dislikes}` });
            }

            page.add(embed);
        }

        return await page.run();
    }

}