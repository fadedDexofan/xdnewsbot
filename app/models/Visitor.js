const mongoose = require("mongoose");

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const visitorSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    userId: { type: Number, required: true, unique: true },
    events: [{ type: ObjectId, ref: "Event" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Visitor", visitorSchema);
