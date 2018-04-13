const { Composer } = require("telegraf");
const startHandler = require("./start");
const addEventHandler = require("./add");
const removeEventHandler = require("./remove");

const composer = new Composer();

composer.command("start", startHandler);
composer.command("add", addEventHandler);
composer.command("remove", removeEventHandler);

module.exports = composer;
