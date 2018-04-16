const { Composer } = require("telegraf");
const startHandler = require("./start");
const menuHandler = require("./menu");
const addEventHandler = require("./add");
const eventsHandler = require("./events");
const removeEventHandler = require("./remove");

const composer = new Composer();

composer.command("start", startHandler);
composer.command("menu", menuHandler);
composer.hears("Меню 📋", menuHandler);
composer.command("add", addEventHandler);
composer.command("remove", removeEventHandler);
composer.command("events", eventsHandler);

module.exports = composer;
