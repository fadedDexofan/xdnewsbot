const { Markup } = require("telegraf");
const PhoneNumber = require("awesome-phonenumber");

module.exports = (user) => {
  let phone = "_не указан_";
  if (user.phone) {
    const ph = new PhoneNumber(user.phone, "RU");
    phone = ph.getNumber("national");
  }
  const message = `👤 *Профиль*\n\n*Имя:* ${user.name ||
    "_не указан_"}\n*Эл. почта:* ${user.email ||
    "_не указан_"}\n*Телефон:* ${phone}\n\nВыберите в меню под сообщением что вы хотели бы изменить.`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.callbackButton("Имя 🏷", "name"), Markup.callbackButton("Эл. почта 📧", "email")],
    [Markup.callbackButton("Телефон 📱", "phone"), Markup.callbackButton("Меню 📋", "menu")],
  ])
    .resize()
    .extra({ parse_mode: "Markdown" });

  return [message, keyboard];
};
