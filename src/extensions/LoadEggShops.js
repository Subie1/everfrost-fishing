/* eslint-disable */
const { TYPES } = require("../lib/Items");
const { Eggs } = require("../lib/Eggs");
const { Pets: PetData } = require("../lib/Pets");

module.exports = class Storage {

    constructor(client) {
        this.name = "Load Egg Shops";

        client.on("interactionCreate", async i => {
            if (!i.isButton()) return;

            const { Mathf, ErrorHandler } = client.params.get("utils");
            const { player } = client.params.get("storage");
            const { Coins, Pets } = player;

            const handler = new ErrorHandler();

            for (const data in player) {
                const container = player[data];
                if (container instanceof Map) continue;
                container.storage.ensure(`${i.guild.id}-${i.user.id}`, container.default);
            }

            const Egg = Eggs[i.customId];

            if (!Egg) return;
            if (!Egg.price) return i.reply({ content: "Failed to purchase, try again later!", ephemeral: true });
            if (Egg.type !== TYPES.Egg) return i.reply({ content: "Failed to purchase, try again later!", ephemeral: true });

            const coins = Coins.storage.get(`${i.guild.id}-${i.user.id}`);
            if (coins < Egg.price) return i.reply({ content: "You do not have enough coins to purchase this egg", ephemeral: true });

            Coins.storage.math(`${i.guild.id}-${i.user.id}`, "-", Egg.price);
            
            const rewards = Egg.pets.map(pet => PetData[pet]);
            const reward = Mathf.chance(rewards);

            if (Egg.OnPurchase) Egg.OnPurchase(i, client);

            await i.reply({ content: `<@${i.user.id}>`, embeds: [handler.embedInfo(`Hatching a ${Egg.name} egg~`, "*What will you get?*", "Something rare maybe????")] });
            Pets.storage.set(`${i.guild.id}-${i.user.id}`, [...Pets.storage.get(`${i.guild.id}-${i.user.id}`), reward.id]);

            setTimeout(async () => {
                await i.followUp({ content: `<@${i.user.id}>`, embeds: [handler.embedInfo(`You got a ${reward.name} (${reward.chance}%)`, `Cooldown: **${reward.cooldown}**`, `I do not support gambling but, you could get more eggs to test your luck 😇`)] });
            }, 1000);
        })
    }

}