const { Markup } = require("telegraf");
const { Event } = require("../models");

module.exports = async (userId) => {
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
  const isOrganizer = !!await Event.find({ organizer: userId })
    .count()
    .exec();
  if (isOrganizer) {
    buttons.push([Markup.callbackButton("Организуемые мной", "my_events")]);
  }
  const buttonsPayload = Markup.inlineKeyboard(buttons)
    .resize()
    .extra({ parse_mode: "Markdown" });
  return ["Меню 🙂", buttonsPayload];
};
