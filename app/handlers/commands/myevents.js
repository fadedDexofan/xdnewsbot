const { Event } = require("../../models");
const { Markup } = require("telegraf");

const myEventsHandler = async (ctx) => {
  const userId = ctx.from.id;
  const events = await Event.find({ organizer: userId }).exec();
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
  const eventsButtons = events
    .map((event) => [Markup.callbackButton(event.name, `${event.id}_show`)])
    .concat([[Markup.callbackButton(Markup.callbackButton("Меню", "menu"))]]);
  ctx.replyWithMarkdown(organizerEvents, Markup.inlineKeyboard(eventsButtons).resize().extra());
};

module.exports = myEventsHandler;
