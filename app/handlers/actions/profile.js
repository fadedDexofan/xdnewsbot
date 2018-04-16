const { profileMenu } = require("../../buttons");
const { Visitor } = require("../../models");

const optionsHandler = async (ctx) => {
  const user = await Visitor.findOne({ userId: ctx.from.id }).exec();
  await ctx.editMessageText(...profileMenu(user));
};

module.exports = optionsHandler;
