const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = class Command {

    constructor() {
        this.name = "generate";
        this.category = "Manage";
        this.description = "Generate anything in the game";

        this.permissions = ["ManageGuild"];
    }

    async run({ message, client }) {
        const { CategoryID } = client.params.get("storage").config;
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        if (!CategoryID.storage.get(message.guild.id).trim().length) return handler.error("Failed to run the command", "The current server doesn't have a template running try using !setup", "Use !templates or !generate for a custom experience (!set is also an option)");

        const embed = new EmbedBuilder();
        embed.setColor(process.env.HEX);
        embed.setTitle("What do you wanna generate?");
        embed.setDescription("*A model will popup for further information on what you wanna create*");

        const choices = new ActionRowBuilder();
        choices.addComponents(
            new ButtonBuilder()
                .setCustomId("action_world")
                .setLabel("World")
                .setEmoji("🌍")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("action_item")
                .setLabel("Item")
                .setEmoji("🎣")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("action_fish")
                .setLabel("Fish")
                .setEmoji("🐠")
                .setStyle(ButtonStyle.Primary),
        )
        
        const req = await message.reply({ embeds: [embed], components: [choices] });
        const collector = req.createMessageComponentCollector({ time: 40_000, filter: (i) => i.user.id === message.author.id, componentType: ComponentType.Button });

        collector.on("collect", async i => {
            if (!i.customId.startsWith("action_")) return;

            const action = i.customId.replace("action_", "");

            if (action == "world") {
                const modal = new ModalBuilder();
                modal.setCustomId("modal_world_generation");
                modal.setTitle("Generate a world!");

                const row1 = new ActionRowBuilder()
                row1.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_name")
                        .setLabel("Name")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Garden")
                        .setRequired(true),
                )

                const row2 = new ActionRowBuilder()
                row2.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_rank")
                        .setLabel("World Rank")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Noobie")
                        .setRequired(true),
                )

                const row3 = new ActionRowBuilder()
                row3.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_cooldown")
                        .setLabel("Cooldown")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("3")
                        .setRequired(true),
                )

                const row4 = new ActionRowBuilder()
                row4.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_min_power")
                        .setLabel("Minimum Power")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("0")
                        .setRequired(true),
                )

                const row5 = new ActionRowBuilder()
                row5.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_fishes")
                        .setLabel("Fishes")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("- Basic Fish\n- Another Fish\n- Another Another Fish")
                        .setRequired(true),
                )

                modal.addComponents(row1, row2, row3, row4, row5);
                await i.showModal(modal);
            }

            if (action == "item") {
                const modal = new ModalBuilder();
                modal.setCustomId("modal_item_generation");
                modal.setTitle("Generate an item!");

                const row1 = new ActionRowBuilder()
                row1.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_name")
                        .setLabel("Name")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Basic Fishing Rod")
                        .setRequired(true),
                )

                const row2 = new ActionRowBuilder()
                row2.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_description")
                        .setLabel("Description")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("This thing feels like it's about to break")
                        .setRequired(false),
                )

                const row3 = new ActionRowBuilder()
                row3.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_power")
                        .setLabel("Power")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("3")
                        .setRequired(true),
                )

                const row4 = new ActionRowBuilder()
                row4.addComponents(
                    new TextInputBuilder()
                        .setCustomId("info_price")
                        .setLabel("Price")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("0")
                        .setRequired(false),
                )

                modal.addComponents(row1, row2, row3, row4);
                await i.showModal(modal);
            }
        })

        collector.on("end", async () => {
            req.edit({ components: [] });
        })
    }

}