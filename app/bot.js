require("dotenv").config();
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const express = require("express");
const { connectDB } = require("./db");
const { rateLimit, responseTime } = require("./middlewares");
const { logError } = require("./helpers");
const { logger } = require("./utils");
const handlers = require("./handlers");

const DEBUG = process.env.NODE_ENV === "development";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(rateLimit);
bot.use(responseTime);
bot.use(handlers.commands, handlers.messages);
bot.use(handlers.actions, handlers.payments);
bot.use(handlers.scenes);

(async () => {
  try {
    await connectDB(process.env.DB_URL);
    logger.info("Бот успешно подключился к MongoDB");
    if (DEBUG) {
      await bot.telegram.deleteWebhook();
      bot.startPolling();
    } else {
      const app = express();
      const { WEBHOOK_LINK } = process.env;
      app.use(bot.webhookCallback(`/${WEBHOOK_LINK}`));
      bot.telegram.setWebhook(`https://xdnews-bot.togudev.ru:443/${WEBHOOK_LINK}`);
      app.listen(3000, () => {
        logger.info("Запущен локальный сервер на порту 3000");
      });
    }
    const botInfo = await bot.telegram.getMe();
    bot.options.username = botInfo.username;
    bot.catch(logError);
    logger.info(`Бот ${bot.options.username} успешно запущен`);
  } catch (err) {
    logger.log(`Во время запуска бота произошла ошибка: ${err}`);
  }
})();
