const Discord = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");

require("./Logger").enable();
require("dotenv").config();

module.exports = class Client extends Discord.Client {

    constructor() {
        super({ intents: ["MessageContent", "Guilds", "GuildMembers", "GuildMessages", "GuildPresences"] });
        this.login(process.env.TOKEN);

        process.on("unhandledRejection", (reason) => {
            console.error(`Unhandled Rejection at: ${reason.stack || reason}`);
        })

        this.once("ready", () => {
            if (process.env.DEBUG) console.log("Ready!");

            setInterval(() => {
                let amount = 0;
                Array.from(this.params.get("storage").player.Coins.storage.values()).forEach(coin => amount += coin);

                this.user.setPresence({
                    activities: [
                        {
                            name: `!help - v1.0.0 (Total of ${amount} coins)`,
                            type: Discord.ActivityType.Watching,
                        }
                    ],
                    status: "dnd",
                })
            }, 10_000)
        })

        this.params = new Map();
        this.extensions = new Map();

        this.handler();
    }

    async handler() {
        const files = readdirSync(join(process.cwd(), "src", "extensions")).filter(file => file.endsWith(".js"));
        for (const file of files) {
            const Extension = require(join("..", "extensions", file));
            const extension = new Extension(this);

            if (extension.export) this.params.set(extension.name.toLowerCase().replace(/\s/g, "_"), extension.export());
            if (process.env.DEBUG) console.logAs(extension.name, `Loaded!`);

            this.extensions.set(extension.name.toLowerCase().replace(/\s/g, "_"), extension);
        }
    }
}