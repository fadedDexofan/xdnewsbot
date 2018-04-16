const { Markup } = require("telegraf");

module.exports = (user) => {
  const message = `👤 *Ваш профиль*\n\n*Имя:* ${user.name ||
    "_не указано_"}\n*Эл. почта:* ${user.email || "_не указан_"}\n*Телефон:* ${user.phone ||
    "_не указан_"}\n\nНажмите кнопку, чтобы изменить`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.callbackButton("Имя", "name"), Markup.callbackButton("Эл. почта", "email")],
    [Markup.callbackButton("Телефон", "phone"), Markup.callbackButton("Меню", "menu")],
  ])
    .resize()
    .extra({ parse_mode: "Markdown" });

  return [message, keyboard];
};
