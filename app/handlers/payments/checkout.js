const { Event } = require("../../models");
const { sendInvoice } = require("../../helpers");

const checkoutHandler = async (ctx) => {
  const eventName = ctx.update.callback_query.data;
  const event = await Event.findOne({ name: eventName }).exec();
  if (event) {
    await sendInvoice(ctx, event);
  } else {
    ctx.reply("Не удалось выставить счет.");
  }
};

module.exports = checkoutHandler;
