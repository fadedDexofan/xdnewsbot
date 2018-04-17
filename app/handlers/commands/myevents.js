const { Event } = require("../../models");

const myEventsHandler = async (ctx) => {
  const userId = ctx.from.id;
  const events = await Event.find({ orginizer: userId }).exec();
  let organizerEvents = "";
  if (!events.length) {
    organizerEvents = "Вы не является организатором события.";
  } else {
    organizerEvents = events.reduce(
      (acc, event) => `${acc}*${event.name}* (\`${event.id}\`)\n`,
      "*Вы являетесь организатором:*\n\n",
    );
    organizerEvents.concat("\nДля просмотра участников используйте команду `/show <id события>`");
  }
  ctx.replyWithMarkdown(organizerEvents);
};

module.exports = myEventsHandler;
