const mongoose = require("mongoose");

const { Schema } = mongoose;

const adminSchema = new Schema({
  name: String,
  userId: Number,
});

module.exports = mongoose.model("Admin", adminSchema);
