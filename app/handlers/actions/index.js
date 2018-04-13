const { Composer } = require("telegraf");
const updateEventsHandler = require("./updateEvents");

const composer = new Composer();

composer.action("update_events", updateEventsHandler);

module.exports = composer;
