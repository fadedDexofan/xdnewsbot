const { Event, Admin } = require("../../models");
const { isAdmin } = require("../../helpers");
const { logger } = require("../../utils");

const removeEventHandler = async (ctx) => {
  if (!await isAdmin(ctx.message)) {
    logger.warn(`${ctx.from.username} (${ctx.from.id}) попытался вызвать команду /remove`);
  } else {
    const eventId = ctx.message.text.replace(/\/remove\s*/, "");
    logger.info(
      `[ADMIN] ${ctx.from.username} (${
        ctx.from.id
      }) вызвал команду /remove с параметром "${eventId}"`,
    );
    try {
      if (!eventId.length) {
        ctx.reply("Вы не указали id события для удаления.");
      } else {
        const event = await Event.findById(eventId).exec();
        if (event) {
          const { name: eventName } = event;
          await event.remove();
          ctx.replyWithMarkdown(`Событие "*${eventName}*" удалено.`);
          logger.info(
            `[ADMIN] ${ctx.from.username} (${
              ctx.from.id
            }) удалил событие "${eventName}" (${eventId})`,
          );
          const admins = await Admin.find().exec();
          admins.map((admin) =>
            ctx.telegram.sendMessage(
              admin.userId,
              `${ctx.from.username} (${ctx.from.id}) удалил событие "*${eventName}*"`,
              { parse_mode: "Markdown" },
            ),
          );
        } else {
          ctx.replyWithMarkdown(`Событие \`${eventId}\` не найдено.`);
        }
      }
    } catch (err) {
      logger.error(
        `${ctx.from.username} (${
          ctx.from.id
        }) попытался удалить событие с \`${eventId}\` с ошибкой: ${err}`,
      );
      ctx.reply("Не удалось удалить событие.");
    }
  }
};

module.exports = removeEventHandler;
