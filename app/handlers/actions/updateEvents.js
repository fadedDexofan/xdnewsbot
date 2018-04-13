const { getEventsPayload } = require("../../helpers");
const { logger } = require("../../utils");

const updateEventsHandler = async (ctx) => {
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
};

module.exports = updateEventsHandler;
