const Timer = require("../lib/Timer");
const { EmbedBuilder } = require("discord.js");
const { useWorlds } = require("../bases/Worlds");
const { Fishes } = require("../lib/Fishes");
const { Items } = require("../lib/Items");

module.exports = class Command {

    constructor() {
        this.name = "fish";
        this.category = "Earn";
        this.description = "Start fishing some fish";

        this.alias = ["reel"];
    }

    async run({ message, client }) {
        const { ErrorHandler, Mathf } = client.params.get("utils");
        const { Bag, Equipped, Registry, Cooldown, Cooldowns } = client.params.get("storage").player;
        const { CategoryID, ShopID } = client.params.get("storage").config;
        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));

        const errorHandler = new ErrorHandler(message);
        const equipped = Equipped.storage.get(`${message.guild.id}-${message.author.id}`);

        if (Cooldown.storage.get(`${message.guild.id}-${message.author.id}`)) {
            const TIME_LEFT = Math.floor(Cooldowns.get(`${message.guild.id}-${message.author.id}`).getRemainingTime() / 1000);
            return errorHandler.error(`You can't run that command now`, `You have to wait ${TIME_LEFT} seconds`);
        }

        for (const world of worlds) {
            if (message.channel.id !== world.id) continue;
            
            const rewards = world.Fishes.map(fish => Fishes[fish]);
            const reward = Mathf.chance(rewards);
            
            if (reward.power > Items(message.guild.id, client)[equipped].power) return errorHandler.error(`You have encountered a fish you can't fish <#${ShopID.storage.get(message.guild.id)}>`, `You have encountered a ${reward.name} and it requires power of ${reward.power} to fish and you only have ${Items(message.guild.id, client)[equipped].power}`, `Navigate to the shop to upgrade your tools`);
            if (!Registry.storage.includes(`${message.guild.id}-${message.author.id}`, reward.id)) Registry.storage.push(`${message.guild.id}-${message.author.id}`, reward.id);
            if (Items(message.guild.id, client)[equipped].OnFish) Items(message.guild.id, client)[equipped].OnFish(message, client);

            const embed = new EmbedBuilder();
            embed.setColor(process.env.HEX);
            embed.setTitle("Fishing away~");
            embed.setDescription("*You have fished and gained some fish!*");
            embed.addFields({ name: "Drops", value: `${reward.name} **(${reward.chance}%)**` });

            Bag.storage.set(`${message.guild.id}-${message.author.id}`, [...Bag.storage.get(`${message.guild.id}-${message.author.id}`), reward.id]);
            Cooldown.storage.set(`${message.guild.id}-${message.author.id}`, true);

            Cooldowns.set(`${message.guild.id}-${message.author.id}`, new Timer(function() {
                if (!Cooldown.storage.get(`${message.guild.id}-${message.author.id}`)) return;
                Cooldown.storage.set(`${message.guild.id}-${message.author.id}`, false);
            }, world.cooldown * 1000));

            return message.reply({ embeds: [embed] });
        }

        return errorHandler.error("You can only run this command in a World channel", `All World channels are located under the category <#${CategoryID.storage.get(message.guild.id)}>`, "Tip: type !worlds to get a list of worlds");
    }

}