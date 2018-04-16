const { Visitor } = require("../../models");
const { Markup } = require("telegraf");

const contactHandler = async (ctx) => {
  const phone = ctx.message.contact.phone_number.replace("+", "");
  const user = await Visitor.findOne({ userId: ctx.from.id }).exec();
  user.phone = phone;
  await user.save();
  ctx.replyWithMarkdown(`*Ваш текущий номер:* ${phone}`, Markup.removeKeyboard().extra());
};

module.exports = contactHandler;
