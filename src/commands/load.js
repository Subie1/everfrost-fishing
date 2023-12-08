const yaml = require("yaml");
const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { useWorlds } = require("../bases/Worlds");
const { RANKS } = require("../lib/Ranks");
const { Items, TYPES } = require("../lib/Items");

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class Command {

    constructor() {
        this.name = "load";
        this.category = "Manage";
        this.description = "Load a template from your library";

        this.permissions = ["ManageGuild"];
    }

    async run({ message, client, args }) {
        const { ServerItems, ServerFishes } = client.params.get("storage").server;
        const { CategoryID } = client.params.get("storage").config;
        const { SubscribedTemplates } = client.params.get("storage").player;
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        SubscribedTemplates.storage.ensure(message.author.id, []);
        if (!args.length) return handler.error("No ID was provided", "Use `'!library'` to find an ID you subscribed too", "Tip: Use `'!subscribe default'` for the default template");
        
        const query = args[0].toLowerCase() == "default" ? process.env.DEFAULT_TEMPLATE : args[0].toLowerCase();
        
        const templates = SubscribedTemplates.storage.get(message.author.id);
        const template = templates.find((template) => template.id == query);

        if (!template) return handler.error("Invalid template ID", `A template with the id \`${query}\` was not found`, "Use `'!library'` for a list of community-made templates");
        if (!CategoryID.storage.get(message.guild.id).trim().length) return handler.error("Failed to run the command", "The current server doesn't have a template running try using !setup", "Use !templates or !generate for a custom experience (!set is also an option)");

        const channel = message.guild.channels.cache.get(CategoryID.storage.get(message.guild.id));
        if (!channel) return handler.error("Failed to create worlds", "The CategoryID in the `!set` links to an invalid category");
        if (channel.type !== ChannelType.GuildCategory) return handler.error("Failed link", "The CategoryID in the `!set` doesn't link to a channel of type `Category`");

        if (template.items) {
            ServerItems.storage.set(message.guild.id, template.items);
        }

        if (template.fishes) {
            ServerFishes.storage.set(message.guild.id, template.fishes);
        }

        for (const parsed of template.worlds) {
            const raw = {
                World: parsed.World,
                Cooldown: parsed.cooldown,

                Fishes: parsed.Fishes,
                "Minimum Power": parsed.MinPower,
                Rank: parsed.Rank
            }

            if (message.guild.channels.cache.find((c) => c.name == parsed.name)) continue;

            await message.guild.channels.create({ name: parsed.name, type: ChannelType.GuildText, parent: channel.id, topic: yaml.stringify(raw) });
        }

        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));

        for (const world of worlds) {
            if (world.World === 0) continue;
            if (!RANKS(worlds)[world.World]) continue;
            
            const RoleExists = message.guild.roles.cache.some(role => role.name === `Rank ${RANKS(worlds)[world.World]}`);
            if (RoleExists) continue;

            const role = await message.guild.roles.create({ name: `Rank ${RANKS(worlds)[world.World]}` });
            const channel = message.guild.channels.cache.get(world.id);

            await channel.permissionOverwrites.create(message.guild.id, { ViewChannel: false });
            await channel.permissionOverwrites.create(role.id, { ViewChannel: true, SendMessages: true });
        }

        const { ShopID } = client.params.get("storage").config;
        const { Shop } = client.params.get("storage").server;
        await Shop.storage.fetchEverything();

        const guild = message.guild;
        ShopID.storage.ensure(guild.id, "");
        if (!ShopID.storage.get(guild.id).trim().length) return;

        const c2 = guild.channels.cache.get(ShopID.storage.get(guild.id));
        Shop.storage.ensure(guild.id, []);

        for (const Item of Object.values(Items(guild.id, client))) {
            if (!Item.price) continue;

            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle(`${Item.name} - ${Item.price.toLocaleString()} snowflakes`);
            embed.setDescription(Item.description ?? "No Description");
            embed.addFields({ name: "Type", value: Object.keys(TYPES).filter(key => TYPES[key] === Item.type)[0] });

            if (Item.power) embed.addFields({ name: "Power", value: `${Item.power}` });

            condition: if (Shop.storage.get(guild.id).find((i) => i.id === Item.id)) {
                try {
                    const result = Shop.storage.get(guild.id).find((i) => i.id === Item.id);
                    const message = await c2.messages.fetch(result.message);
                    message.edit({ embeds: [embed] });

                    await wait(1000);
                    continue;
                } catch (err) {
                    break condition;
                }
            }

            const row = new ActionRowBuilder();
            row.addComponents(
                new ButtonBuilder()
                    .setLabel("Purchase")
                    .setCustomId(Item.id)
                    .setStyle(ButtonStyle.Success),
            )

            const message = await c2.send({ embeds: [embed], components: [row] });
            Shop.storage.push(guild.id, { id: Item.id, message: message.id });

            await wait(1000);
        }

        const embed = new EmbedBuilder();
        embed.setColor(process.env.HEX);
        embed.setTitle("Successfully loaded the template");
        embed.setDescription("*Navigate to the Worlds' Category to start fishing!*");

        return message.channel.send({ embeds: [embed] });
    }

}