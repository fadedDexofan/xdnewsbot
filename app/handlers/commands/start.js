const { Markup } = require("telegraf");

const startHandler = (ctx) => {
  ctx.reply(
    "Привет! Выбери действие нажав на кнопку снизу 🙂",
    Markup.keyboard([
      [Markup.button("Текущие 📢"), Markup.button("Мои 🎟")],
      [Markup.button("Посещенные 📜")],
    ])
      .resize()
      .extra(),
  );
};

module.exports = startHandler;
