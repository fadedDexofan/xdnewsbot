const { Event } = require("../../models");
const { logger } = require("../../utils");

const eventsHandler = async (ctx) => {
  if (!ctx.state.isAdmin) {
    logger.warn(`${ctx.from.username} (${ctx.from.id}) попытался вызвать команду /events`);
  } else {
    logger.info(`${ctx.from.username} (${ctx.from.id}) вызвал команду /events`);
    const events = await Event.find().exec();
    if (events.length) {
      events.sort((a, b) => a.startDate - b.startDate);
      const allEvents = events.reduce(
        (acc, event) => `${acc}*${event.name}* (\`${event.id}\`)\n`,
        "",
      );
      ctx.replyWithMarkdown(`*Все события*:\n\n${allEvents}`);
    } else {
      ctx.reply("В базе нет событий.");
    }
  }
};

module.exports = eventsHandler;
