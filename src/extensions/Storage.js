const Enmap = require("enmap");

function CreateStorage(df, name) {
    if (!name) return { storage: new Enmap(), default: df };
    return { storage: new Enmap({ name, autoFetch: true, fetchAll: false }), default: df };
}

module.exports = class Storage {

    constructor() {
        this.name = "Storage";

        this.player = {
            Rank: CreateStorage(0, "Rank"),
            Equipped: CreateStorage("", "Equipped"),
            Registry: CreateStorage([], "Registery"),
            Coins: CreateStorage(500, "Coins"),
            Cooldown: CreateStorage(false),
            AFK: CreateStorage(false),
            Inventory: CreateStorage([], "Inventory"),
            Bag: CreateStorage([], "Bag"),
            Pets: CreateStorage([], "Pets"),
            Cooldowns: new Map(),

            SubscribedTemplates: CreateStorage([], "SubscribedTemplates"),
        }

        this.server = {
            Shop: CreateStorage([], "Shop"),
            EggShop: CreateStorage("", "EggShop"),
            ServerItems: CreateStorage({}, "Items"),
            ServerFishes: CreateStorage({}, "Fishes"),
        }

        this.config = {
            CategoryID: CreateStorage("", "CategoryID"),
            ShopID: CreateStorage("", "ShopID"),
        }

        this.core = {
            Templates: CreateStorage([], "Templates"),
            CommunityTemplates: CreateStorage([], "CommunityTemplates"),
        }
    }

    export() {
        return { player: this.player, server: this.server, config: this.config, core: this.core };
    }

}