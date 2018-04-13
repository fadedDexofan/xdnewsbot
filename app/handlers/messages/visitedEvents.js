const { Event } = require("../../models");
const { moment } = require("../../utils");

const visitedEventsHandler = async (ctx) => {
  const events = await Event.find({
    "participants.userId": ctx.from.id,
    startDate: { $lt: Date.now() },
  }).exec();
  const eventsPayload = events.reduce((acc, event) => {
    const date = moment(event.startDate).format("D MMMM YYYY, HH:mm");
    return `${acc}*${event.name}* (${date})\n`;
  }, "");
  if (eventsPayload) {
    const replyPayload = `*Посещенные вами события:*\n\n${eventsPayload}`;
    ctx.replyWithMarkdown(replyPayload);
  } else {
    ctx.reply("Вы не посетили ни одного события 🙁");
  }
};

module.exports = visitedEventsHandler;
