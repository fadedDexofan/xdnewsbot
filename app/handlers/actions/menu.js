const { menu } = require("../../buttons");

const menuHandler = async (ctx) => {
  const [text, keyboard] = await menu(ctx.from.id);
  ctx.editMessageText(text, keyboard);
};

module.exports = menuHandler;
