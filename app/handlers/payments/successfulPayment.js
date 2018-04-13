const { Event } = require("../../models");
const { logger } = require("../../utils");

const successfulPaymentHandler = async (ctx) => {
  const { name, email } = ctx.message.successful_payment.order_info;
  const event = await Event.findOne({
    name: JSON.parse(ctx.message.successful_payment.invoice_payload).name,
  }).exec();
  event.participants.addToSet({ name, email, userId: ctx.from.id });
  await event.save();
  logger.info(
    `$${ctx.from.username} (${ctx.from.id}) заплатил ${ctx.message.successful_payment.total_amount /
      100} ₽.`,
  );
  logger.info(`Данные заказа: ${ctx.message.successful_payment.order_info}`);
  logger.info(
    `${ctx.from.username} (${ctx.from.id}) зарегистрировался на мероприятие "${event.name}"`,
  );
};

module.exports = successfulPaymentHandler;
