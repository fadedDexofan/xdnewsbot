const { getEventsPayload } = require("../../helpers");

const currentEventsHandler = async ({ replyWithMarkdown }) =>
  replyWithMarkdown(...(await getEventsPayload()));

module.exports = currentEventsHandler;
