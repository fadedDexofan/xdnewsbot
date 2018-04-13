const { Event } = require("../../models");
const { logger } = require("../../utils");

const removeEventHandler = async (ctx) => {
  if (!ctx.state.isAdmin) {
    logger.warn(`${ctx.from.username} (${ctx.from.id}) попытался вызвать команду /remove`);
  } else {
    const eventName = ctx.message.text.replace(/\/remove\s*/, "");
    logger.info(
      `[ADMIN] ${ctx.from.username} (${
        ctx.from.id
      }) вызвал команду /remove с параметром "${eventName}"`,
    );
    try {
      if (!eventName.length) {
        ctx.reply("Вы не указали имя события для удаления.");
      } else {
        const event = await Event.findOne({ name: eventName }).exec();
        if (event) {
          await event.remove();
          ctx.replyWithMarkdown(`Событие *${eventName}* удалено.`);
          logger.info(
            `[ADMIN] ${ctx.from.username} (${ctx.from.id}) удалил событие "${eventName}"`,
          );
        } else {
          ctx.replyWithMarkdown(`Событие *${eventName}* не найдено.`);
        }
      }
    } catch (err) {
      logger.error(
        `${ctx.from.username} (${
          ctx.from.id
        }) попытался удалить событие "${eventName}" с ошибкой: ${err}`,
      );
      ctx.reply("Не удалось удалить событие.");
    }
  }
};

module.exports = removeEventHandler;
