const { menu } = require("../../buttons");

const menuHandler = async (ctx) => ctx.editMessageText(...(await menu(ctx.from.id)));

module.exports = menuHandler;
