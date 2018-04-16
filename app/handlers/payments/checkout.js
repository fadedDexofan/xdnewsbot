const { Event, Visitor } = require("../../models");
const { Markup } = require("telegraf");
const { sendInvoice } = require("../../helpers");
const { logger } = require("../../utils");

const checkoutHandler = async (ctx) => {
  const callback = ctx.update.callback_query.data;
  const eventId = callback.replace("_register", "");
  const event = await Event.findById(eventId).exec();
  if (/register/.test(callback)) {
    const user = await Visitor.findOne({ userId: ctx.from.id }).exec();
    const alreadyRegistered = await Event.find({ _id: eventId, visitors: user._id })
      .count()
      .exec();
    if (alreadyRegistered) {
      event.visitors.pull({ _id: user._id });
      user.events.pull({ _id: event._id });
      await event.save();
      await user.save();
      ctx.answerCbQuery();
      ctx.replyWithMarkdown(`Вы отменили регистрацию на "*${event.name}*"`);
      logger.info(`${ctx.from.username} (${ctx.from.id}) отменил регистрацию на "${event.name}"`);
    } else {
      await Event.findByIdAndUpdate({ _id: event._id }, { $addToSet: { visitors: user } }).exec();
      await Visitor.findByIdAndUpdate({ _id: user._id }, { $addToSet: { events: event } }).exec();
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
      const user = await Visitor.findOne({ userId: ctx.from.id }).exec();
      const alreadyRegistered = await Event.find({ _id: eventId, visitors: user._id })
        .count()
        .exec();
      const registerButtonText = alreadyRegistered ? "☹️ Не пойду" : "🤘 Пойду";
      const buttonsPayload = [Markup.callbackButton(registerButtonText, `${event.id}_register`)];
      if (event.url) buttonsPayload.push(Markup.urlButton("Подробнее", event.url));
      ctx.answerCbQuery();
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

module.exports = checkoutHandler;
