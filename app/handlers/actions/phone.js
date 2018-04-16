const { Markup } = require("telegraf");

const phoneHandler = async (ctx) => {
  ctx.replyWithMarkdown(
    "Отправьте ваш номер телефона",
    Markup.keyboard([[Markup.contactRequestButton("Поделиться моим номером телефона")]])
      .oneTime()
      .resize()
      .extra(),
  );
};

module.exports = phoneHandler;
