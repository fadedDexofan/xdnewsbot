const { getEventsPayload } = require("../../helpers");

const currentEventsHandler = async (ctx) => ctx.editMessageText(...(await getEventsPayload()));

module.exports = currentEventsHandler;
