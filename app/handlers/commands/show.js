const { Event } = require("../../models");
const { logger } = require("../../utils");
const { getCsv } = require("../../helpers");

const showHandler = async (ctx) => {
  const eventId = ctx.message.text.replace(/\/show\s*/, "");
  try {
    if (!eventId.length) {
      ctx.reply("Вы не указали id события.");
      return;
    }
    const event = await Event.findById(eventId).exec();
    if (!event) {
      ctx.replyWithMarkdown(`Событие c Id \`${eventId}\` не найдено.`);
      return;
    }
    if (!event.visitors) {
      const message = `Нет зарегистрировавшихся на *${event.name}*`;
      ctx.replyWithMarkdown(message);
      return;
    }
    const [fileContents, filename] = await getCsv(event);
    await ctx.replyWithDocument({
      source: fileContents,
      filename,
    });
    logger.info(`${ctx.from.username} (${ctx.from.id}) выгрузил участников "${event.name}"`);
  } catch (err) {
    logger.error(
      `${ctx.from.username} (${
        ctx.from.id
      }) попытался посмотреть участников события \`${eventId}\` с ошибкой: ${err}`,
    );
    ctx.reply("Произошла ошибка.");
  }
};

module.exports = showHandler;
