const Admin = require("../models/Admin");

module.exports = async (message) => {
  const { id } = message.from;
  return !!await Admin.find({ userId: id })
    .count()
    .exec();
};
