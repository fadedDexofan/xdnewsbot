const { Composer } = require("telegraf");
const updateEventsHandler = require("./updateEvents");
const menuHandler = require("./menu");
const currentEventsHandler = require("./currentEvents");
const userEventsHandler = require("./userEvents");
const visitedEventsHandler = require("./visitedEvents");
const profileHandler = require("./profile");
const contactHandler = require("./contact");
const phoneHandler = require("./phone");
const processMessage = require("./processMessage");
const myEventsHandler = require("./myevents");

const composer = new Composer();

composer.action("update_events", updateEventsHandler);
composer.action("menu", menuHandler);
composer.action("phone", phoneHandler);
composer.action("name", (ctx) => {
  ctx.reply("Отправьте ваши имя и фамилию.\n\nОтправьте /cancel для отмены.");
  ctx.session.USER_STATE = "ASK_NAME";
});
composer.action("email", (ctx) => {
  ctx.reply("Отправьте вашу эл. почту.\n\nОтправьте /cancel для отмены.");
  ctx.session.USER_STATE = "ASK_EMAIL";
});
composer.on("contact", contactHandler);
composer.on("message", processMessage);
composer.action("current_events", currentEventsHandler);
composer.action("user_events", userEventsHandler);
composer.action("visited_events", visitedEventsHandler);
composer.action("profile", profileHandler);
composer.action("my_events", myEventsHandler);

module.exports = composer;
