const { readdirSync } = require("fs");
const { join } = require("path");

const Pets = {};

const files = readdirSync("./src/lib/Pets").filter(file => file.endsWith(".js"));
for (const file of files) {
    const RPet = require(join(process.cwd(), "src", "lib", "Pets", file));
    const Pet = new RPet();
    if (!Pet.id) Pet.id = Pet.name.toLowerCase().replace(/\s/g, "_");
    Pets[Pet.id] = Pet;
}

module.exports.Pets = Pets;