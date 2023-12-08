const { Fishes } = require("../lib/Fishes");

module.exports = class Command {

    constructor() {
        this.name = "sell";
        this.category = "Earn";
        this.description = "Sell the fish in your bag";
    }

    async run({ message, client }) {
        const { ErrorHandler } = client.params.get("utils");
        const { Bag, Coins } = client.params.get("storage").player;

        const errorHandler = new ErrorHandler(message);

        const fishes = Bag.storage.get(`${message.guild.id}-${message.author.id}`).map(fish => { return { ...Fishes[fish] }}).filter(fish => fish.sell);
        if (!fishes.length) return errorHandler.error("You do not have any fish", "Why not type !fish in a world channel", "Tip: Run !worlds for a list of worlds");

        let amount = 0;

        for (const fish of fishes) {
            Bag.storage.remove(`${message.guild.id}-${message.author.id}`, (f) => f === fish.id);
            amount += fish.sell;
        }
        
        Coins.storage.math(`${message.guild.id}-${message.author.id}`, "add", amount);

        return errorHandler.info(`You sold ${fishes.length == 1 ? "1 fish" : `${fishes.length.toLocaleString()} fishes`}`, `You gained $${amount.toLocaleString()}`);
    }

}