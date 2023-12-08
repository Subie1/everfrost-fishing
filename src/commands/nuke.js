const { EmbedBuilder } = require("discord.js");
const { useWorlds } = require("../bases/Worlds");
const { RANKS } = require("../lib/Ranks");

module.exports = class Command {

    constructor() {
        this.name = "deload";
        this.category = "Manage";
        this.description = "Delete all world channels in the server";

        this.alias = ["nuke"]

        this.permissions = ["ManageGuild"];
    }

    async run({ message, client }) {
        const { ServerItems, ServerFishes } = client.params.get("storage").server;
        const { CategoryID } = client.params.get("storage").config;
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        if (!CategoryID.storage.get(message.guild.id).trim().length) return handler.error("Failed to run the command", "The current server doesn't have a template running try using !setup", "Use !templates or !generate for a custom experience (!set is also an option)");
        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));

        for (const world of worlds) {
            const channel = message.guild.channels.cache.get(world.id);
            if (channel) await channel.delete();

            const role = message.guild.roles.cache.find(role => role.name === `Rank ${RANKS(worlds)[world.World]}`);
            if (role) await role.delete();
        }

        ServerItems.storage.set(message.guild.id, ServerItems.default);
        ServerFishes.storage.set(message.guild.id, ServerFishes.default);

        const embed = new EmbedBuilder();
        embed.setColor(process.env.HEX);
        embed.setTitle("Successfully deloaded the template");
        embed.setDescription("*Use `'!load ID'` to reload a template*");

        return message.channel.send({ embeds: [embed] });
    }

}