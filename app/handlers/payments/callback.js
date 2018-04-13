const { Event } = require("../../models");
const { Markup } = require("telegraf");
const { sendInvoice } = require("../../helpers");
const { logger } = require("../../utils");

const callbackHandler = async (ctx) => {
  const callback = ctx.update.callback_query.data;
  const eventId = callback.replace("_register", "");
  const event = await Event.findById(eventId).exec();
  console.log(ctx.update.callback_query.message.message_id);
  if (/register/.test(callback)) {
    const alreadyRegistered = await Event.find({ _id: eventId, "participants.userId": ctx.from.id })
      .count()
      .exec();
    if (alreadyRegistered) {
      event.participants.pull({ userId: ctx.from.id });
      await event.save();
      ctx.answerCbQuery();
      ctx.replyWithMarkdown(`Вы отменили регистрацию на "*${event.name}*"`);
      logger.info(`${ctx.from.username} (${ctx.from.id}) отменил регистрацию на "${event.name}"`);
    } else {
      const userFullName = `${ctx.from.first_name} ${ctx.from.last_name}`;
      event.participants.addToSet({ name: userFullName, userId: ctx.from.id });
      await event.save();
      ctx.answerCbQuery();
      ctx.replyWithMarkdown(`Вы успешно зарегистрировались на "*${event.name}*"`);
      logger.info(`${ctx.from.username} (${ctx.from.id}) зарегистрировался на "${event.name}"`);
    }
    const registerButtonText = alreadyRegistered ? "🤘 Пойду" : "☹️ Не пойду";
    const buttonsPayload = [Markup.callbackButton(registerButtonText, `${event.id}_register`)];
    if (event.url) buttonsPayload.push(Markup.urlButton("Подробнее", event.url));
    ctx.editMessageReplyMarkup(Markup.inlineKeyboard(buttonsPayload));
  } else if (event) {
    if (event.price === 0) {
      logger.info(
        `${ctx.from.username} (${ctx.from.id}) собирается зарегистрироваться на "${event.name}"`,
      );
      const alreadyRegistered = await Event.find({
        _id: eventId,
        "participants.userId": ctx.from.id,
      })
        .count()
        .exec();
      const registerButtonText = alreadyRegistered ? "☹️ Не пойду" : "🤘 Пойду";
      const buttonsPayload = [Markup.callbackButton(registerButtonText, `${event.id}_register`)];
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
};

module.exports = callbackHandler;
