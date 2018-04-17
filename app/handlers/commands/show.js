const { Event, Visitor } = require("../../models");
const { logger } = require("../../utils");

const showHandler = async (ctx) => {
  const eventId = ctx.message.text.replace(/\/show\s*/, "");
  try {
    if (!eventId.length) {
      ctx.reply("Вы не указали id события.");
    } else {
      const event = await Event.findById(eventId).exec();
      const eventVisitorsMessage = `Зарегистрировавшиеся на *${event.name}*:\n\n`;
      if (!event) {
        ctx.replyWithMarkdown(`Событие c Id \`${eventId}\` не найдено.`);
        return;
      }
      if (!event.visitors.length) {
        eventVisitorsMessage.concat("Нет зарегистрировавшихся.");
        ctx.replyWithMarkdown(eventVisitorsMessage);
        return;
      }
      const eventVisitors = await Visitor.find({ events: event._id }).exec();
      const eventVisitorsPayload = eventVisitors.map(
        (visitor) =>
          `*Имя:* ${visitor.name}\n*Эл. почта:* ${visitor.email}\n*Телефон:* ${visitor.phone}\n\n`,
      );
      ctx.replyWithMarkdown(eventVisitorsMessage.concat(...eventVisitorsPayload));
    }
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
