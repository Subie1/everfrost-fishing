const { Items } = require("../lib/Items");

module.exports = class Command {

    constructor() {
        this.name = "equip";
        this.category = "Settings";
        this.description = "Equip an item from your inventory";

        this.alias = ["select", "use"];
    }

    async run({ message, args, client }) {
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        if (!args.length) return handler.error("You did not provide any arguments", "To use this command you need to provide a item id (item_name) or name (Item Name) as arguments", "Tip: Run !equip Basic Fishing Rod")

        const query = args.join(" ").toLowerCase().replace(/\s/g, "_");

        const { Inventory, Equipped } = client.params.get("storage").player;
        const items = Inventory.storage.get(`${message.guild.id}-${message.author.id}`).map(item => Items(message.guild.id, client)[item]);

        for (const item of items) {
            if (query !== item.id) continue;
            Equipped.storage.set(`${message.guild.id}-${message.author.id}`, item.id);

            return handler.info("Successfully equipped item!", `You now have ${item.name} equipped`);
        }

        return handler.error("You do not have that item", `Item \`${args.join(" ")}\` does not exist in your inventory`, "Tip: Try using !inventory to check your items");
    }

}