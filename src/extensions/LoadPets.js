/* eslint-disable */
const { TYPES } = require("../lib/Items");
const { Eggs } = require("../lib/Eggs");
const { Pets: PetData } = require("../lib/Pets");

module.exports = class Storage {

    constructor(client) {
        this.name = "Load Pets";
        this.intervals = new Map();

        this.client = client;

        this.client.on("messageCreate", async message => {
            if (message.author.bot) return;
            if (!message.guild) return;

            const { player } = this.client.params.get("storage");
            const { AFK } = player;

            if (!AFK.storage.get(`${message.guild.id}-${message.author.id}`)) return;

            const { ErrorHandler } = this.client.params.get("utils");
            const handler = new ErrorHandler(message);

            for (const data in player) {
                const container = player[data];
                if (container instanceof Map) continue;
                container.storage.ensure(`${message.guild.id}-${message.author.id}`, container.default);
                
                try { await container.storage.fetchEverything(); } catch(err) { console.log(err); continue; }
            }

            if (AFK.storage.get(`${message.guild.id}-${message.author.id}`)) {
                clearInterval(this.intervals.get(`${message.guild.id}-${message.author.id}`));
                this.intervals.delete(`${message.guild.id}-${message.author.id}`);

                AFK.storage.set(`${message.guild.id}-${message.author.id}`, AFK.default);
                return handler.info("Welcome back.", "Your auto-fishing has finished check your bag to see the rewards", "Tip: use !bag to check your bag");
            }
        })
    }

    export() {
        return this.intervals;
    }

}