const { readdirSync } = require("fs");
const { join } = require("path");

const Eggs = {};

const files = readdirSync("./src/lib/Eggs").filter(file => file.endsWith(".js"));
for (const file of files) {
    const REgg = require(join(process.cwd(), "src", "lib", "Eggs", file));
    const Egg = new REgg();
    if (!Egg.id) Egg.id = Egg.name.toLowerCase().replace(/\s/g, "_");
    Eggs[Egg.id] = Egg;
}

module.exports.Eggs = Eggs;