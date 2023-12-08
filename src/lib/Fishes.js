const { readdirSync } = require("fs");
const { join } = require("path");

const Fishes = {};

const files = readdirSync("./src/lib/Fishes").filter(file => file.endsWith(".js"));
for (const file of files) {
    const RFish = require(join(process.cwd(), "src", "lib", "Fishes", file));
    const Fish = new RFish();
    if (!Fish.id) Fish.id = Fish.name.toLowerCase().replace(/\s/g, "_");
    Fishes[Fish.id] = Fish;
}

module.exports.Fishes = Fishes;