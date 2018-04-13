const createInvoice = require("./createInvoice");
const { logger } = require("../utils");

const sendInvoice = async (ctx, event) => {
  const { name } = event;
  logger.info(`${ctx.from.username} (${ctx.from.id}) собирается оплатить участие в "${name}"`);
  try {
    await ctx.replyWithInvoice(createInvoice(event));
    if (!ctx.message) {
      await ctx.answerCbQuery();
    }
    logger.info(
      `Счет для ${ctx.from.username} (${ctx.from.id}) за событие "${name}" успешно выставлен`,
    );
  } catch (err) {
    logger.error(`Произошла ошибка во время выставления счета для события "${name}": ${err}`);
  }
};

module.exports = sendInvoice;
