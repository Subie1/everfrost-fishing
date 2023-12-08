module.exports = class Command {

    constructor() {
        this.name = "donate";
        this.category = "Earn";
        this.description = "Donate money to some cuties";

        this.alias = ["pay"];
    }

    async run({ message, args, client }) {
        const { ErrorHandler } = client.params.get("utils");
        const handler = new ErrorHandler(message);

        const mentioned = message.mentions.users.first();

        if (!mentioned) return handler.error("You did not mention anyone to pay", "Try re-using the command !donate 1000 @User", "Tip: You should use common math when gifting money lmao");
        if (!args.length) return handler.error("You did not provide any coins to donate", "Try re-using the command !donate 1000 @User");
        if (isNaN(args[0])) return handler.error("You did not use N U M B E R S when trying to send M O N E Y", "If you didn't know, money is numbers.", "Tip: Use your brain");

        const { Coins } = client.params.get("storage").player;
        const query = parseInt(args[0]);

        if (isNaN(query)) return handler.error("I can't generate money out of thin air", "Well I can but I won't do it, so grind some money first to be able to give to others", "Tip: Try and donate money you actually have");
        if (query <= 0) return handler.error("You can't take money from others", "See, it was a nice attempt. But you failed miserably <3", "Tip: Use your brain");
        if (Coins.storage.get(`${message.guild.id}-${message.author.id}`) < query) return handler.error("I can't generate money out of thin air", "Well I can but I won't do it, so grind some money first to be able to give to others", "Tip: Try and donate money you actually have");

        Coins.storage.math(`${message.guild.id}-${message.author.id}`, "-", query);
        Coins.storage.math(`${message.guild.id}-${mentioned.id}`, "+", query);

        handler.info(`You sent ${query} to ${mentioned.username}`, `- You now have: **${Coins.storage.get(`${message.guild.id}-${message.author.id}`).toLocaleString()} snowflakes**\n- ${mentioned.username} now has: **${Coins.storage.get(`${message.guild.id}-${mentioned.id}`).toLocaleString()} snowflakes**`);
    }

}