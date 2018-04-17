const { Event, Visitor } = require("../../models");
const { sendInvoice } = require("../../helpers");
const { menu } = require("../../buttons");

const startHandler = async (ctx) => {
  const userId = ctx.from.id;
  const username = `${ctx.from.first_name} ${ctx.from.last_name}`;
  const user = await Visitor.find({ userId })
    .count()
    .exec();
  if (!user) {
    await Visitor.create({ userId, name: username });
  }
  const eventId = ctx.message.text.replace(/\/start\s*/, "");
  ctx.reply(...(await menu(userId)));
  if (eventId.length) {
    const event = await Event.findById(eventId).exec();
    if (event) {
      await sendInvoice(ctx, event);
    }
  }
};

module.exports = startHandler;
