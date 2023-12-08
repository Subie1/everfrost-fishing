module.exports = class Command {

    constructor() {
        this.name = "cooldown";
        this.category = "Information";
        this.description = "Get the remaining amount of time in your cooldown";

        this.alias = ["cd"];
    }

    async run({ message, client }) {
        const { Cooldown, Cooldowns } = client.params.get("storage").player;
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        const user = message.mentions.users.first() ?? message.author;

        if (Cooldown.storage.get(`${message.guild.id}-${user.id}`)) {
            const TIME_LEFT = Math.floor(Cooldowns.get(`${message.guild.id}-${user.id}`).getRemainingTime() / 1000);
            return handler.info(`${user.username} current cooldown`, `${TIME_LEFT} seconds`);
        }

        handler.error(`${user.username} doesn't have a cooldown`);
    }

}