const { Event, Admin } = require("../../models");
const { isJSON, isAdmin } = require("../../helpers");
const { logger, moment } = require("../../utils");

const addEventHandler = async (ctx) => {
  if (!await isAdmin(ctx.message)) {
    logger.warn(`${ctx.from.username} (${ctx.from.id}) попытался вызвать команду /add`);
  } else {
    let payload = ctx.message.text.replace(/\/add\s*/, "");
    logger.info(
      `${ctx.from.username} (${ctx.from.id}) вызвал команду /add с параметрами: ${payload}`,
    );
    if (payload && isJSON(payload)) {
      payload = JSON.parse(payload);
      const {
        name, description, price, maxVisitors, photoUrl, url,
      } = payload;
      let { startDate } = payload;
      startDate = moment(startDate);
      const eventPayload = {
        name,
        description,
        price,
        startDate,
        maxVisitors,
        photoUrl,
        url,
      };
      try {
        await Event.create(eventPayload);
        logger.info(`[ADMIN] ${ctx.from.username} (${ctx.from.id}) добавил событие "${name}"`);
        ctx.replyWithMarkdown(`Событие "*${name}*" успешно добавлено.`);
        const admins = await Admin.find().exec();
        admins.map((admin) =>
          ctx.telegram.sendMessage(
            admin.userId,
            `${ctx.from.username} (${ctx.from.id}) добавил событие "*${name}*"`,
            { parse_mode: "Markdown" },
          ),
        );
      } catch (err) {
        logger.error(`Ошибка добавления события: ${err}`);
        ctx.reply("Ошибка добавления события.");
      }
    } else {
      const schema = `{
  "name": !String,
  "description": !String,
  "price": !Number (0 || >=60),
  "startDate": !Date (YYYY-MM-DD HH:MM),
  "maxVisitors": !Number,
  "photoUrl": !String,
  "url": String
}`;
      ctx.replyWithMarkdown(`Некорректный JSON. Формат команды /add \n\`${schema}\``);
    }
  }
};

module.exports = addEventHandler;
