const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = class Util {

    constructor() {
        this.name = "Utils";
    }

    export() {
        return { ErrorHandler, Mathf, Pagination };
    }

}

const Mathf = {

    chunks(array, size = 10) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            const chunk = array.slice(i, i + size);
            chunks.push(chunk);
        }
        return chunks;
    },

    chance(data) {
        let i;
        let weights = [data[0].chance];
    
        for (i = 1; i < data.length; i++)
            weights[i] = data[i].chance + weights[i - 1];
        
        var random = Math.random() * weights[weights.length - 1];
        
        for (i = 0; i < weights.length; i++)
            if (weights[i] > random)
                break;
        
        return data[i];
    },

    capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

}

module.exports.Mathf = Mathf;

class Pagination {

    constructor(message, color = process.env.HEX) {
        this.target = message;
        this.color = color;
        this.embeds = [];
    }

    add(embed) {
        this.embeds.push(embed);
    }

    async run() {
        if (!this.embeds.length) return;

        this.index = 0;
        this.currentEmbed = this.embeds[0];
        this.currentEmbed.setFooter({ text: `${this.index + 1}/${this.embeds.length}` });

        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("action_0")
                .setEmoji("◀️"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setCustomId("action_2")
                .setLabel("⛔"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("action_1")
                .setLabel("▶️"),
        )

        this.message = await this.target.reply({ embeds: [this.currentEmbed], components: [row] });
        const collector = this.message.createMessageComponentCollector({ time: 40_000, filter: (i) => i.user.id === this.target.author.id, componentType: ComponentType.Button });

        collector.on("collect", async i => {
            if (!i.customId.startsWith("action_")) return;

            const action = parseInt(i.customId.replace("action_", ""));

            condition: if (action == 0) {
                if (this.index == 0) {
                    this.index = this.embeds.length - 1;
                    break condition;
                }

                this.index -= 1;
            }

            condition: if (action == 1) {
                if (this.index == this.embeds.length - 1) {
                    this.index = 0;
                    break condition;
                }

                this.index += 1;
            }

            if (action == 2) {
                return collector.stop();
            }

            this.currentEmbed = this.embeds[this.index];
            this.currentEmbed.setFooter({ text: `${this.index + 1}/${this.embeds.length}` });
            
            await i.update({ embeds: [this.currentEmbed] });
        })

        collector.on("end", async () => {
            this.message.edit({ components: [] });
        })
    }
}

class ErrorHandler {

    constructor(message) {
        this.message = message;

        this.infoHex = "#ffffff";
        this.errorHex = "#fd5555";
        this.warningHex = "#ffd600";
    }

    embedInfo(title="Information was attempted to be sent", detail="", action="") {
        const embed = new EmbedBuilder();
        embed.setColor(this.infoHex);
        embed.setTitle(title);

        if (detail.length) embed.setDescription(detail);
        if (action.length) embed.setFooter({ text: action });

        return embed;
    }

    embedError(title="Error was attempted to be sent", detail="", action="") {
        const embed = new EmbedBuilder();
        embed.setColor(this.errorHex);
        embed.setTitle(title);

        if (detail.length) embed.setDescription(detail);
        if (action.length) embed.setFooter({ text: action });

        return embed;
    }

    embedWarning(title="Warning was attempted to be sent", detail="", action="") {
        const embed = new EmbedBuilder();
        embed.setColor(this.warningHex);
        embed.setTitle(title);

        if (detail.length) embed.setDescription(detail);
        if (action.length) embed.setFooter({ text: action });

        return embed;
    }

    info(title="Information was attempted to be sent", detail="", action="") {
        const embed = new EmbedBuilder();
        embed.setColor(this.infoHex);
        embed.setTitle(title);

        if (detail.length) embed.setDescription(detail);
        if (action.length) embed.setFooter({ text: action });

        return this.message.reply({ embeds: [embed] });
    }

    error(title="Error was attempted to be sent", detail="", action="") {
        const embed = new EmbedBuilder();
        embed.setColor(this.errorHex);
        embed.setTitle(title);

        if (detail.length) embed.setDescription(detail);
        if (action.length) embed.setFooter({ text: action });

        return this.message.reply({ embeds: [embed] });
    }

    warning(title="Warning was attempted to be sent", detail="", action="") {
        const embed = new EmbedBuilder();
        embed.setColor(this.warningHex);
        embed.setTitle(title);

        if (detail.length) embed.setDescription(detail);
        if (action.length) embed.setFooter({ text: action });

        return this.message.reply({ embeds: [embed] });
    }

}