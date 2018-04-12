require("dotenv").config();
const Telegraf = require("telegraf");
const rateLimit = require("telegraf-ratelimit");
const express = require("express");
const moment = require("moment");
const logger = require("./utils/logger");
const Event = require("./models/Event");
const connectDB = require("./db/connection");
const { createInvoice, isAdmin, isJson } = require("./helpers");

const { Markup } = Telegraf;

const DEBUG = process.env.NODE_ENV !== "production";

moment.locale("ru");

const bot = new Telegraf(process.env.BOT_TOKEN);

const limitConfig = {
  window: 1000,
  limit: 1,
  onLimitExceeded: ({ reply }) => reply("Превышено количество обращений в секунду"),
};

bot.use(rateLimit(limitConfig));

bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`Время ответа - ${ms} ms`);
});

bot.catch((err) => logger.error(`Ошибка бота: ${err}`));

bot.use(async (ctx, next) => {
  if (ctx.message) {
    ctx.state.isAdmin = await isAdmin(ctx.message);
  }
  await next();
});

async function eventsToMessage(events) {
  return events.reduce((acc, event) => {
    const {
      description, startDate, price, name, maxParticipants, participants,
    } = event;
    const date = moment(startDate).format("D MMMM YY, HH:mm");
    const freePlaces = maxParticipants - participants.length;
    return `${acc}*${name}*\n${description}\n\n📆 ${date}\n🎟 Участие: ${price} ₽\n👥 Мест: ${freePlaces} из ${maxParticipants}\n\n`;
  }, "");
}

async function getEventsPayload() {
  const events = await Event.find({ startDate: { $gte: Date.now() } }).exec();
  events.sort((a, b) => a.startDate - b.startDate);
  const eventButtons = events
    .map((event) => [Markup.callbackButton(event.name, event.name)])
    .concat([[Markup.callbackButton("🔄 Обновить", "update_events")]]);
  const eventsMessage = (await eventsToMessage(events)) || "На ближайшее время нет событий 🕸";
  return [
    `*Текущие события:*\n\n${eventsMessage}`,
    Markup.inlineKeyboard(eventButtons).extra({ parse_mode: "Markdown" }),
  ];
}

bot.start(async (ctx) => {
  ctx.reply(
    "Привет! Выбери действие нажав на кнопку снизу 🙂",
    Markup.keyboard([
      [Markup.button("Текущие 📢"), Markup.button("Мои 🎟")],
      [Markup.button("Посещенные 📜")],
    ])
      .resize()
      .extra(),
  );
});

bot.hears("Текущие 📢", async ({ replyWithMarkdown }) =>
  replyWithMarkdown(...(await getEventsPayload())),
);

bot.hears("Мои 🎟", async (ctx) => {
  const userEvents = await Event.find({
    "participants.userId": ctx.from.id,
    startDate: { $gte: Date.now() },
  }).exec();
  const myEvents = userEvents.reduce((acc, event) => {
    const date = moment(event.startDate).format("D MMMM YY, HH:mm");
    return `${acc}*${event.name}* (${date})\n`;
  }, "");
  if (myEvents) {
    const replyPayload = `*Вы зарегистрировались на:*\n\n${myEvents}`;
    ctx.replyWithMarkdown(replyPayload);
  } else {
    ctx.reply("Вы никуда не зарегистрировались 🤷‍♂️");
  }
});

bot.hears("Посещенные 📜", async (ctx) => {
  const events = await Event.find({
    "participants.userId": ctx.from.id,
    startDate: { $lt: Date.now() },
  }).exec();
  const eventsPayload = events.reduce((acc, event) => {
    const date = moment(event.startDate).format("D MMMM YY, HH:mm");
    return `${acc}*${event.name}* (${date})\n`;
  }, "");
  if (eventsPayload) {
    const replyPayload = `*Посещенные вами события:*\n\n${eventsPayload}`;
    ctx.replyWithMarkdown(replyPayload);
  } else {
    ctx.reply("Вы не посетили ни одного события 🙁");
  }
});

bot.command("add", async (ctx) => {
  if (!ctx.state.isAdmin) {
    logger.warn(`${ctx.from.username} (${ctx.from.id}) попытался вызвать команду /remove`);
  } else {
    let payload = ctx.message.text.replace("/add ", "");
    logger.info(
      `${ctx.from.username} (${ctx.from.id}) вызвал команду /add с параметрами: ${payload}`,
    );
    if (payload && isJson(payload)) {
      payload = JSON.parse(payload);
      const {
        name, description, price, maxParticipants, photoUrl, url,
      } = payload;
      let { startDate } = payload;
      startDate = moment(startDate);
      const eventPayload = {
        name,
        description,
        price,
        startDate,
        maxParticipants,
        photoUrl,
        url,
      };
      try {
        await Event.create(eventPayload);
        logger.info(`[ADMIN] ${ctx.from.username} (${ctx.from.id}) добавил событие "${name}"`);
        ctx.replyWithMarkdown(`Событие *${name}* успешно добавлено.`);
      } catch (err) {
        logger.error(`Ошибка добавления события: ${err}`);
        ctx.reply("Ошибка добавления события.");
      }
    } else {
      const schema = `{
  "name": !String,
  "description": !String,
  "price": !Number (>=60),
  "startDate": !Date (YYYY-MM-DD HH:MM),
  "maxParticipants": !Number,
  "photoUrl": !String,
  "url": String
}`;
      ctx.replyWithMarkdown(
        `Некорректный JSON. Формат команды /add {JSON события}.\n\`${schema}\``,
      );
    }
  }
});

bot.command("/remove", async (ctx) => {
  if (!ctx.state.isAdmin) {
    logger.warn(`${ctx.from.username} (${ctx.from.id}) попытался вызвать команду /remove`);
  } else {
    const eventName = ctx.message.text.replace("/remove ", "");
    logger.info(
      `[ADMIN] ${ctx.from.username} (${
        ctx.from.id
      }) вызвал команду /remove с параметром "${eventName}"`,
    );
    try {
      const event = await Event.findOne({ name: eventName }).exec();
      if (event) {
        await event.remove();
        ctx.replyWithMarkdown(`Событие *${eventName}* удалено.`);
        logger.info(`[ADMIN] ${ctx.from.username} (${ctx.from.id}) удалил событие "${eventName}"`);
      } else {
        ctx.replyWithMarkdown(`Событие *${eventName}* не найдено.`);
      }
    } catch (err) {
      logger.error(
        `${ctx.from.username} (${
          ctx.from.id
        }) попытался удалить событие "${eventName}" с ошибкой: ${err}`,
      );
      ctx.reply("Не удалось удалить событие.");
    }
  }
});

Event.find().then((events) => {
  events.forEach((event) => {
    const { name } = event;
    bot.action(name, async (ctx) => {
      logger.info(`${ctx.from.username} (${ctx.from.id}) собирается оплатить участие в "${name}"`);
      try {
        await ctx.replyWithInvoice(createInvoice(event));
        logger.info(
          `Счет для ${ctx.from.username} (${ctx.from.id}) за событие "${name}" успешно выставлен`,
        );
      } catch (err) {
        logger.error(`Произошла ошибка во время выставления счета для события "${name}"`);
      }
    });
  });
});

bot.action("update_events", async (ctx) => {
  const [text, keyboard] = await getEventsPayload();
  try {
    await ctx.editMessageText(text, keyboard);
    await ctx.answerCbQuery("События обновлены");
  } catch (err) {
    if (err.code === 400) {
      await ctx.answerCbQuery("Обновления не найдены");
    } else {
      logger.error(
        `${ctx.from.username} (${ctx.from.id}) попытался обновить список событий с ошибкой: ${err}`,
      );
    }
  }
});

bot.on("pre_checkout_query", ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true));

bot.on("successful_payment", async (ctx) => {
  const { name, email } = ctx.message.successful_payment.order_info;
  const event = await Event.findOne({
    name: JSON.parse(ctx.message.successful_payment.invoice_payload).name,
  }).exec();
  event.participants.addToSet({ name, email, userId: ctx.from.id });
  await event.save();
  logger.info(
    `$${ctx.from.username} (${ctx.from.id}) заплатил ${ctx.message.successful_payment.total_amount /
      100} ₽.`,
  );
  logger.info(`Данные заказа: ${ctx.message.successful_payment.order_info}`);
  logger.info(
    `${ctx.from.username} (${ctx.from.id}) зарегистрировался на мероприятие "${event.name}"`,
  );
});

(async () => {
  try {
    await connectDB(process.env.DB_URL);
    logger.info("Бот успешно подключился к MongoDB");
    if (DEBUG) {
      bot.startPolling();
    } else {
      const app = express();
      app.use(bot.webhookCallback("/hgQbAWfe"));
      bot.telegram.setWebhook("https://xdnews-bot.xadev.ru:443/hgQbAWfe");
      app.listen(3000, () => {
        logger.info("Запущен локальный сервер на порту 3000");
      });
    }
    const botInfo = await bot.telegram.getMe();
    bot.options.username = botInfo.username;
    logger.info(`Бот ${bot.options.username} успешно запущен`);
  } catch (err) {
    logger.log(`Во время запуска бота произошла ошибка: ${err}`);
  }
})();
