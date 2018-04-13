const { logger } = require("../utils");

module.exports = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`Время ответа - ${ms} ms`);
};
