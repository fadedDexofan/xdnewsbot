require("dotenv").config();
const Telegraf = require("telegraf");
const rateLimit = require("telegraf-ratelimit");
const express = require("express");
const moment = require("moment");
const Event = require("./models/Event");
const connectDB = require("./db/connection");
const { createInvoice, isAdmin, isJson } = require("./helpers");

const { Markup } = Telegraf;

const DEBUG = process.env.NODE_ENV === "development";

moment.locale("ru");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username;
});

const limitConfig = {
  window: 1000,
  limit: 1,
};

bot.use(rateLimit(limitConfig));

bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`Время ответа - ${ms} ms`);
});

bot.catch((err) => console.error(err));

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
  const eventsMessage = await eventsToMessage(events);
  return [
    `*Текущие события:*\n\n${eventsMessage}`,
    Markup.inlineKeyboard(eventButtons).extra({ parse_mode: "Markdown" }),
  ];
}

bot.start(async (ctx) => {
  ctx.reply(
    "Привет! Выбери действие нажав на кнопку.",
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
    ctx.reply("Необходимо обладать правами администратора.");
  } else {
    let payload = ctx.message.text.replace("/add ", "");
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
        ctx.replyWithMarkdown(`Событие *${name}* успешно добавлено.`);
      } catch (err) {
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
    ctx.reply("Необходимо обладать правами администратора.");
  } else {
    const eventName = ctx.message.text.replace("/remove ", "");
    try {
      const event = await Event.findOne({ name: eventName }).exec();
      if (event) {
        await event.remove();
        ctx.replyWithMarkdown(`Событие *${eventName}* удалено.`);
      } else {
        ctx.replyWithMarkdown(`Событие *${eventName}* не найдено.`);
      }
    } catch (err) {
      ctx.reply("Не удалось удалить событие.");
    }
  }
});

Event.find().then((events) => {
  events.forEach((event) => {
    const { name } = event;
    bot.action(name, async (ctx) => {
      console.log(`${ctx.from.username} собирается оплатить ${name}.`);
      await ctx.replyWithInvoice(createInvoice(event));
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
  console.log(
    `${ctx.from.first_name} (${ctx.from.username}) заплатил ${ctx.message.successful_payment
      .total_amount / 100} ₽.`,
  );
  console.log(ctx.message.successful_payment.order_info);
});

(async () => {
  try {
    await connectDB(process.env.DB_URL);
    console.log(`Successfully connected to MongoDB at ${process.env.DB_URL}`);
    if (DEBUG) {
      bot.startPolling();
    } else {
      const app = express();
      app.use(bot.webhookCallback("/bot"));
      bot.telegram.setWebhook("https://xdnews-bot.xadev.ru:443/bot");
      app.get("/", (req, res) => {
        res.send("resp");
      });
      app.listen(3000, () => {
        console.log("Server started at port 3000");
      });
    }
    console.log("Bot successfully started");
  } catch (err) {
    console.error(err);
  }
})();
