const { menu } = require("../../buttons");

const menuHandler = async (ctx) => ctx.replyWithMarkdown(...menu);

module.exports = menuHandler;
