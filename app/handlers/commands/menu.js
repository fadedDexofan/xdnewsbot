const { menu } = require("../../buttons");

const menuHandler = async (ctx) => ctx.replyWithMarkdown(...(await menu(ctx.from.id)));

module.exports = menuHandler;
