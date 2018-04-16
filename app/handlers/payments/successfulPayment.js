const { Event, Visitor } = require("../../models");
const { logger } = require("../../utils");
const { getEventsPayload } = require("../../helpers");

const successfulPaymentHandler = async (ctx) => {
  const { name, email, phone } = ctx.message.successful_payment.order_info;
  const { id } = JSON.parse(ctx.message.successful_payment.invoice_payload);
  const user = await Visitor.findOne({ userId: ctx.from.id }).exec();
  const event = await Event.findById(id).exec();
  await Event.findByIdAndUpdate({ _id: event._id }, { $addToSet: { visitors: user } }).exec();
  await Visitor.findByIdAndUpdate(
    { _id: user._id },
    {
      name,
      email,
      phone,
      $addToSet: { events: event },
    },
  ).exec();
  ctx.replyWithMarkdown(...(await getEventsPayload()));
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
