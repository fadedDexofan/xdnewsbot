const rateLimit = require("telegraf-ratelimit");

const limitConfig = {
  window: 1000,
  limit: 1,
  onLimitExceeded: ({ reply }) => reply("Превышено количество обращений в секунду"),
};

module.exports = rateLimit(limitConfig);
