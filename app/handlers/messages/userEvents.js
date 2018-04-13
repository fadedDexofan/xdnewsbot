const { Event } = require("../../models");
const { moment } = require("../../utils");

const userEventsHandler = async (ctx) => {
  const userEvents = await Event.find({
    "participants.userId": ctx.from.id,
    startDate: { $gte: Date.now() },
  }).exec();
  const myEvents = userEvents.reduce((acc, event) => {
    const date = moment(event.startDate).format("D MMMM, HH:mm");
    return `${acc}*${event.name}* (${date})\n`;
  }, "");
  if (myEvents) {
    const replyPayload = `*Вы зарегистрировались на:*\n\n${myEvents}`;
    ctx.replyWithMarkdown(replyPayload);
  } else {
    ctx.reply("Вы никуда не зарегистрировались 🤷‍♂️");
  }
};

module.exports = userEventsHandler;
