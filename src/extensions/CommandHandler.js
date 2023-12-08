const { join } = require("path");
const { readdirSync } = require("fs");

module.exports = class CommandHandler {

    constructor(client) {
        this.name = "Command Handler";
        
        this.client = client;

        this.commands = new Map();
        this.alias = new Map();

        this.prefix = process.env.PREFIX;

        this.client.on("messageCreate", async message => {
            if (message.author.bot) return;
            if (!message.guild) return;
            if (!message.content.startsWith(process.env.PREFIX)) return;

            const { player, config } = this.client.params.get("storage");
            const { ErrorHandler } = this.client.params.get("utils");
            const { AFK } = player;

            for (const data in player) {
                const container = player[data];
                if (container instanceof Map) continue;
                container.storage.ensure(`${message.guild.id}-${message.author.id}`, container.default);

                const mentioned = message.mentions.users.first();
                if (mentioned) container.storage.ensure(`${message.guild.id}-${mentioned.id}`, container.default);
                
                try { await container.storage.fetchEverything(); } catch(err) { console.error(err); continue; }
            }

            for (const data in config) {
                const container = config[data];
                if (container instanceof Map) continue;
                container.storage.ensure(message.guild.id, container.default);

                try { await container.storage.fetchEverything(); } catch (err) { console.error(err); continue; }
            }

            if (AFK.storage.get(`${message.guild.id}-${message.author.id}`)) return;

            const args = message.content.slice(this.prefix.length).split(" ");
            const command = args.shift().toLowerCase();

            if (!this.commands.has(command) && !this.alias.has(command)) return;

            const errorHandler = new ErrorHandler(message);
            const cmd = this.commands.get(command) ?? this.alias.get(command);

            if ((cmd.name !== "help" && cmd.category !== "Manage" && (!config.CategoryID.storage.get(message.guild.id).trim().length || !config.ShopID.storage.get(message.guild.id).trim().length)) || (cmd.name == "export" && (!config.CategoryID.storage.get(message.guild.id).trim().length || !config.ShopID.storage.get(message.guild.id).trim().length))) return errorHandler.error("Failed to run the command", "The current server doesn't have a template running try using !setup", "Use !templates or !generate for a custom experience (!set is also an option)");

            condition: if (cmd.permissions) {
                if (!cmd.permissions.length) break condition;

                let passed = true;

                for (const permission of cmd.permissions) {
                    if (!message.member.permissions.has(permission)) passed = false;
                }

                if (!passed) return errorHandler.error();
            }

            try {
                await cmd.run({ message, client, args, handler: this, commands: this.commands, hex: process.env.HEX, command: cmd });
            } catch (err) {
                console.errorAs(cmd.name, err.stack ?? err);
            }
        })

        this.handler();
    }

    async handler() {
        const files = readdirSync(join(process.cwd(), "src", "commands")).filter(file => file.endsWith(".js"));
        for (const file of files) {
            try {
                const Command = require(join("..", "commands", file));

                const command = new Command(this.client);
                this.commands.set(command.name, command);

                if (command.alias) command.alias.forEach(alias => this.alias.set(alias, command));
            } catch(err) {
                console.errorAs(file, `${err}`);
            }
        }
    }

    export() {
        return { commands: this.commands, alias: this.alias };
    }

}