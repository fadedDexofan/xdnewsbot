const json2csv = require("json2csv").parse;
const { Visitor } = require("../models");
const { moment } = require("../utils");

module.exports = async (event) => {
  const eventVisitors = await Visitor.find({ events: event._id }).exec();
  const eventVisitorsObject = eventVisitors.map((visitor) => ({
    name: visitor.name,
    email: visitor.email,
    phone: visitor.phone,
  }));
  const filename = `${event.name}_${moment().format("YYYY-MM-DD_HH-mm")}.csv`;
  const fields = ["name", "email", "phone"];
  const opts = { fields };
  const csv = json2csv(eventVisitorsObject, opts);
  const fileContents = Buffer.from(csv);
  return [fileContents, filename];
};
