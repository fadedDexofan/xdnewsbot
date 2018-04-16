const { menu } = require("../../buttons");

const menuHandler = async (ctx) => ctx.editMessageText(...menu);

module.exports = menuHandler;
