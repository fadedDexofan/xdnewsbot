const { Event } = require("../../models");
const { createInvoice } = require("../../helpers");
const { logger } = require("../../utils");

const checkoutHandler = async (ctx) => {
  const eventName = ctx.update.callback_query.data;
  console.log();
  const event = await Event.findOne({ name: eventName }).exec();
  const { name } = event;
  logger.info(`${ctx.from.username} (${ctx.from.id}) собирается оплатить участие в "${name}"`);
  try {
    await ctx.replyWithInvoice(createInvoice(event));
    await ctx.answerCbQuery();
    logger.info(
      `Счет для ${ctx.from.username} (${ctx.from.id}) за событие "${name}" успешно выставлен`,
    );
  } catch (err) {
    logger.error(`Произошла ошибка во время выставления счета для события "${name}"`);
  }
};

module.exports = checkoutHandler;
