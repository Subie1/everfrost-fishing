const { EmbedBuilder } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "setup";
        this.category = "Information";
        this.description = "Get info about the setup of this bot";
    }

    async run({ message }) {
        const embed = new EmbedBuilder()
        embed.setColor(process.env.HEX);
        embed.setTitle("How to setup this bot:");
        embed.setDescription("*It's actually a pretty simple process*");
        embed.addFields({ name: "# Creating worlds!", value: "*First you to need to category for the worlds, the process is simple.*\n- Create a category call it anything, we will call it 'Worlds'.\n- Copy the Category ID.\n- Use `!set CategoryID [PASTE ID HERE]`\n- You're done!" });
        embed.addFields({ name: "# Creating the shop!", value: "*This is easy as the creating worlds section!*\n- Create a channel call it anything, we will call it 'Shop'.\n- Copy the Channel ID.\n- Use `!set ShopID [PASTE ID HERE]`\n- You're done!" });
        embed.addFields({ name: "# Loading a template!", value: "*This is even more of a simple process, there is countless of templates to choose from but for this case we will use the default on, you can always use `!templates` for a list of Community-Made ones.*\n- Use `!subscribe default` to add the template to your library (`!library`).\n- Use `!load default` and you're done!" });
        embed.addFields({ name: "# How do I fish?", value: "*Just navigate to any World channel and use !fish*" });

        return message.reply({ embeds: [embed] });
    }

}