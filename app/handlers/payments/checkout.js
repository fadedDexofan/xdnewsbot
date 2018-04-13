const { Event } = require("../../models");
const { Markup } = require("telegraf");
const { sendInvoice } = require("../../helpers");
const { logger } = require("../../utils");

const checkoutHandler = async (ctx) => {
  const callback = ctx.update.callback_query.data;
  if (/register/.test(callback)) {
    const eventId = callback.replace("_register", "");
    const event = await Event.findById(eventId).exec();
    const alreadyRegistered = await Event.find({ _id: eventId, "participants.userId": ctx.from.id })
      .count()
      .exec();
    if (alreadyRegistered) {
      ctx.replyWithMarkdown(`Вы уже зарегистрированы на "*${event.name}*"`);
      ctx.answerCbQuery();
    } else {
      const userFullName = `${ctx.from.first_name} ${ctx.from.last_name}`;
      event.participants.addToSet({ name: userFullName, userId: ctx.from.id });
      await event.save();
      ctx.answerCbQuery();
      ctx.replyWithMarkdown(`Вы успешно зарегистрировались на "*${event.name}*"`);
      logger.info(
        `${ctx.from.username} (${ctx.from.id}) зарегистрировался на мероприятие "${event.name}"`,
      );
    }
  } else {
    const eventId = callback;
    const event = await Event.findById(eventId).exec();
    if (event) {
      if (event.price === 0) {
        logger.info(
          `${ctx.from.username} (${ctx.from.id}) собирается зарегистрироваться на "${event.name}"`,
        );
        const buttonsPayload = [
          Markup.callbackButton("🤘 Зарегистрироваться", `${event.id}_register`),
        ];
        if (event.url) buttonsPayload.push(Markup.urlButton("Подробнее", event.url));
        ctx.replyWithMarkdown(
          `*${event.name}*\n\n${event.description}`,
          Markup.inlineKeyboard(buttonsPayload).extra(),
        );
      } else {
        await sendInvoice(ctx, event);
      }
    } else {
      logger.warn(
        `${ctx.from.username} (${ctx.from.id}) попытался выставить счет за несуществующее событие`,
      );
      ctx.reply("Не удалось выставить счет.");
    }
  }
};

module.exports = checkoutHandler;
