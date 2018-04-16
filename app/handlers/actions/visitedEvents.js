const { Event, Visitor } = require("../../models");
const { moment } = require("../../utils");
const { backButton } = require("../../buttons");

const visitedEventsHandler = async (ctx) => {
  const user = await Visitor.findOne({ userId: ctx.from.id }).exec();
  const events = await Event.find({
    visitors: user._id,
    startDate: { $lt: Date.now() },
  }).exec();
  const eventsPayload = events.reduce((acc, event) => {
    const date = moment(event.startDate).format("D MMMM YYYY, HH:mm");
    return `${acc}*${event.name}* (${date})\n`;
  }, "");
  if (eventsPayload) {
    const replyPayload = `*Посещенные вами события:*\n\n${eventsPayload}`;
    ctx.editMessageText(replyPayload, backButton);
  } else {
    ctx.editMessageText("Вы не посетили ни одного события 🙁", backButton);
  }
};

module.exports = visitedEventsHandler;
