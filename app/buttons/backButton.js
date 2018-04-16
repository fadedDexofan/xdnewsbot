const { Markup } = require("telegraf");

const backButton = Markup.inlineKeyboard([Markup.callbackButton("Меню", "menu")])
  .resize()
  .extra({ parse_mode: "Markdown" });

module.exports = backButton;
