const { Composer } = require("telegraf");
const currentEventsHandler = require("./currentEvents");
const userEventsHandler = require("./userEvents");
const visitedEventsHandler = require("./visitedEvents");

const composer = new Composer();

composer.hears("Текущие 📢", currentEventsHandler);
composer.hears("Мои 🎟", userEventsHandler);
composer.hears("Посещенные 📜", visitedEventsHandler);

module.exports = composer;
