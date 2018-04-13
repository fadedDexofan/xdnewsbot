const { Event } = require("../../models");
const { isJSON } = require("../../helpers");
const { logger, moment } = require("../../utils");

const addEventHandler = async (ctx) => {
  if (!ctx.state.isAdmin) {
    logger.warn(`${ctx.from.username} (${ctx.from.id}) попытался вызвать команду /remove`);
  } else {
    let payload = ctx.message.text.replace("/add ", "");
    logger.info(
      `${ctx.from.username} (${ctx.from.id}) вызвал команду /add с параметрами: ${payload}`,
    );
    if (payload && isJSON(payload)) {
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
      ctx.replyWithMarkdown(`Некорректный JSON. Формат команды /add \n\`${schema}\``);
    }
  }
};

module.exports = addEventHandler;
