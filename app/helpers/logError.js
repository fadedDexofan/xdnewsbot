const { logger } = require("../utils");

module.exports = (err) => logger.error(`Ошибка бота: ${err}`);
