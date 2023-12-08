const { EmbedBuilder } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "library";
        this.category = "Manage";
        this.description = "Check out all your subscribed templates";
    }

    async run({ message, client }) {
        const { Pagination, Mathf } = client.params.get("utils");
        const { SubscribedTemplates } = client.params.get("storage").player;

        SubscribedTemplates.storage.ensure(message.author.id, []);
        const chunks = Mathf.chunks(SubscribedTemplates.storage.get(message.author.id), 10);
        const page = new Pagination(message);

        for (const chunk of chunks) {
            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle("Subscribed Library");
            embed.setDescription("To unsubscribe use `'!unsubscribe'` (Use `'!load ID'` to use a template)");

            for (const template of chunk) {
                const author = await client.users.fetch(template.author);
                embed.addFields({ name: `- ${template.name} (*@${author ? author.username : "Anonymous"}*)`, value: `\`${template.id}\`` });
            }

            page.add(embed);
        }

        return await page.run();
    }

}