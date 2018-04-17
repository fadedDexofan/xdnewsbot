const { Markup } = require("telegraf");
const { Event } = require("../models");

const menu = async (userId) => {
  const organizer = await Event.find({ organizer: userId })
    .count()
    .exec();
  const buttons = [
    [
      Markup.callbackButton("Текущие 📢", "current_events"),
      Markup.callbackButton("Мои 🎟", "user_events"),
    ],
    [
      Markup.callbackButton("Посещенные 📜", "visited_events"),
      Markup.callbackButton("Профиль 👤", "profile"),
    ],
  ];
  if (organizer) {
    buttons.push([[Markup.callbackButton("Организуемые события", "organizer_events")]]);
  }
  return [
    "Меню 🙂",
    Markup.inlineKeyboard(buttons)
      .resize()
      .extra({ parse_mode: "Markdown" }),
  ];
};

module.exports = menu;
