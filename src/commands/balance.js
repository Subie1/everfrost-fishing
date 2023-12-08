module.exports = class Command {

    constructor() {
        this.name = "balance";
        this.category = "Information";
        this.description = "Get your current balance";

        this.alias = ["bal", "flakes", "snowflakes"];
    }

    async run({ message, client }) {
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        const user = message.mentions.users.first() ?? message.author;

        const { Coins } = client.params.get("storage").player;
        handler.info(`${user.username} has ${Coins.storage.get(`${message.guild.id}-${user.id}`).toLocaleString()} snowflakes`);
    }

}