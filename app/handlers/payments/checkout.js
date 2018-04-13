const { Event } = require("../../models");
const { sendInvoice } = require("../../helpers");
const { logger } = require("../../utils");

const checkoutHandler = async (ctx) => {
  const eventName = ctx.update.callback_query.data;
  const event = await Event.findOne({ name: eventName }).exec();
  if (event) {
    await sendInvoice(ctx, event);
  } else {
    logger.warn(
      `${ctx.from.username} (${ctx.from.id}) попытался выставить счет за несуществующее событие`,
    );
    ctx.reply("Не удалось выставить счет.");
  }
};

module.exports = checkoutHandler;
