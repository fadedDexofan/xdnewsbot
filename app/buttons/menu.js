const { Markup } = require("telegraf");

const menu = [
  "Меню 🙂",
  Markup.inlineKeyboard([
    [
      Markup.callbackButton("Текущие 📢", "current_events"),
      Markup.callbackButton("Мои 🎟", "user_events"),
    ],
    [
      Markup.callbackButton("Посещенные 📜", "visited_events"),
      Markup.callbackButton("Профиль 👤", "profile"),
    ],
  ])
    .resize()
    .extra({ parse_mode: "Markdown" }),
];

module.exports = menu;
