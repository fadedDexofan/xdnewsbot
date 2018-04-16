const { Event, Visitor } = require("../../models");
const { moment } = require("../../utils");
const { backButton } = require("../../buttons");

const userEventsHandler = async (ctx) => {
  const user = await Visitor.findOne({ userId: ctx.from.id }).exec();
  const userEvents = await Event.find({
    visitors: user._id,
    startDate: { $gte: Date.now() },
  }).exec();
  const myEvents = userEvents.reduce((acc, event) => {
    const date = moment(event.startDate).format("D MMMM, HH:mm");
    return `${acc}*${event.name}* (${date})\n`;
  }, "");
  if (myEvents) {
    const replyPayload = `*Вы зарегистрировались на:*\n\n${myEvents}`;
    ctx.editMessageText(replyPayload, backButton);
  } else {
    ctx.editMessageText("Вы никуда не зарегистрировались 🤷‍♂️", backButton);
  }
};

module.exports = userEventsHandler;
