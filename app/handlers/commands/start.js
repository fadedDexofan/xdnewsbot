const { Markup } = require("telegraf");
const { Event } = require("../../models");
const { sendInvoice } = require("../../helpers");

const startHandler = async (ctx) => {
  const eventId = ctx.message.text.replace(/\/start\s*/, "");
  ctx.reply(
    "Привет! Выбери действие нажав на кнопку снизу 🙂",
    Markup.keyboard([
      [Markup.button("Текущие 📢"), Markup.button("Мои 🎟")],
      [Markup.button("Посещенные 📜")],
    ])
      .resize()
      .extra(),
  );
  if (eventId.length) {
    const event = await Event.findById(eventId).exec();
    if (event) {
      await sendInvoice(ctx, event);
    }
  }
};

module.exports = startHandler;
