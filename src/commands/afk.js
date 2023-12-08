const { useWorlds } = require("../bases/Worlds");
const { Pets: PetData } = require("../lib/Pets");
const { Fishes } = require("../lib/Fishes");

module.exports = class Command {

    constructor() {
        this.name = "autofish";
        this.description = "Auto-fish with your pets";
        this.category = "Earn";

        this.alias = ["afk"];
    }

    async run({ message, args, client }) {
        const { ErrorHandler, Mathf } = client.params.get("utils");
        const { CategoryID } = client.params.get("storage").config;
        const handler = new ErrorHandler(message);

        const intervals = client.params.get("load_pets");
        const { AFK, Pets, Rank, Bag } = client.params.get("storage").player;

        if (!args.length) return handler.error("You did not provide any pet name", "*You need to provide a pet in your stable to auto-fish with*", "Tip: Use !pets to see your pets");
        
        const query = args.join(" ").toLowerCase().replace(/\s/g, "_");
        if (!PetData[query]) return handler.error("Pet does not exist", "*The pet you provided does not exist*", "Tip: Use !pets to see your pets");
        if (!Pets.storage.includes(message.author.id, query)) return handler.error("Pet does not exist", "*The pet you provided does not exist*", "Tip: Use !pets to see your pets");

        const pet = PetData[query];

        const worlds = useWorlds(client, message.guild.id, CategoryID.storage.get(message.guild.id));
        const world = worlds[Rank.storage.get(`${message.guild.id}-${message.author.id}`)];

        handler.info("You are now AUTO-FISHING", `To get out of auto-fishing just send a message.\nYour pet will generate a fish every ${(world.cooldown * pet.cooldown).toLocaleString()} seconds`, "Tip: This technically means you are AFK");

        AFK.storage.set(`${message.guild.id}-${message.author.id}`, true);
        intervals.set(`${message.guild.id}-${message.author.id}`, setInterval(() => {
            if (world) {
                const fishes = world.Fishes.map(fish => Fishes[fish]);
                const reward = Mathf.chance(fishes);

                Bag.storage.set(`${message.guild.id}-${message.author.id}`, [...Bag.storage.get(`${message.guild.id}-${message.author.id}`), reward.id]);
            }
        }, world.cooldown * pet.cooldown * 1000));
    }

}