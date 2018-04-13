const { isAdmin } = require("../helpers");

module.exports = async (ctx, next) => {
  if (ctx.message) {
    ctx.state.isAdmin = await isAdmin(ctx.message);
  }
  await next();
};
