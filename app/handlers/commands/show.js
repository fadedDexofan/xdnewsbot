const { Event, Visitor } = require("../../models");
const { logger, moment } = require("../../utils");
const fs = require("fs");
const json2csv = require("json2csv").parse;

const tempDir = "temp";

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const showHandler = async (ctx) => {
  const eventId = ctx.message.text.replace(/\/show\s*/, "");
  try {
    if (!eventId.length) {
      ctx.reply("Вы не указали id события.");
      return;
    }
    const event = await Event.findById(eventId).exec();
    if (!event) {
      ctx.replyWithMarkdown(`Событие c Id \`${eventId}\` не найдено.`);
      return;
    }
    if (!event.visitors) {
      const message = `Нет зарегистрировавшихся на *${event.name}*`;
      ctx.replyWithMarkdown(message);
      return;
    }
    const eventVisitors = await Visitor.find({ events: event._id }).exec();
    const eventVisitorsObject = eventVisitors.map((visitor) => ({
      name: visitor.name,
      email: visitor.email,
      phone: visitor.phone,
    }));
    const fields = ["name", "email", "phone"];
    const opts = { fields };
    const csv = json2csv(eventVisitorsObject, opts);
    const filename = `${event.name}_${moment().format("YYYY-MM-DD_HH-mm")}.csv`;
    const tempPath = `temp/${filename}`;
    const fileContents = Buffer.from(csv);
    fs.writeFile(tempPath, fileContents, () => {
      await ctx.replyWithDocument({
        source: tempPath,
		filename: filename,
      });
    });
  } catch (err) {
    logger.error(
      `${ctx.from.username} (${
        ctx.from.id
      }) попытался посмотреть участников события \`${eventId}\` с ошибкой: ${err}`,
    );
    ctx.reply("Произошла ошибка.");
  }
};

module.exports = showHandler;
