const { Markup } = require("telegraf");
const { Event } = require("../models");
const { moment } = require("../utils");

const eventsToMessage = (events) =>
  events.reduce((acc, event) => {
    const {
      description, startDate, price, name, maxVisitors, visitors,
    } = event;
    const date = moment(startDate).format("D MMMM, HH:mm");
    const freePlaces = maxVisitors - visitors.length;
    const enterPrice = price ? `${price} ₽` : "бесплатно";
    return `${acc}*${name}*\n${description}\n\n📆 ${date}\n🎟 Участие: ${enterPrice}\n👥 Мест: ${freePlaces} из ${maxVisitors}\n\n`;
  }, "");

module.exports = async () => {
  const events = await Event.find({ startDate: { $gte: Date.now() } }).exec();
  events.sort((a, b) => a.startDate - b.startDate);
  const eventButtons = events
    .map((event) => [Markup.callbackButton(event.name, event.id)])
    .concat([[Markup.callbackButton("🔄 Обновить", "update_events"), Markup.callbackButton("Меню", "menu")]]);
  const eventsMessage = eventsToMessage(events) || "На ближайшее время нет событий 🕸";
  return [
    `*Текущие события:*\n\n${eventsMessage}`,
    Markup.inlineKeyboard(eventButtons).extra({ parse_mode: "Markdown" }),
  ];
};
