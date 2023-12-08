const { TYPES } = require("../Items");

module.exports = class Item {

    constructor() {
        this.name = "Basic Fishing Rod";
        this.description = "This thing feels like it's about to break";

        this.type = TYPES.Rod;
        this.power = 10;
        this.fortune = 0;

        this.price = 500;
    }

}