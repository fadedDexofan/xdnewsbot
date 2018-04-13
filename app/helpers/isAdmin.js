const { Admin } = require("../models");

module.exports = async (message) => {
  const { id } = message.from;
  return !!await Admin.find({ userId: id })
    .count()
    .exec();
};
