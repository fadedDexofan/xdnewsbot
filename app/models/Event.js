const mongoose = require("mongoose");
const Visitor = require("./Visitor");

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const eventSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    url: { type: String },
    price: {
      type: Number,
      required: true,
      validate: {
        validator: (val) => val === 0 || val >= 60,
        message: "{PATH} should be  0 || >=60",
      },
    },
    description: { type: String, required: true },
    startDate: { type: Date, required: true, default: Date.now() },
    photoUrl: { type: String, required: false },
    visitors: [{ type: ObjectId, ref: "Visitor" }],
    maxVisitors: { type: Number, required: true, default: 30 },
  },
  { timestamps: true },
);

eventSchema.pre("remove", function updateUsers(next) {
  Visitor.update({ events: this._id }, { $pull: { events: this._id } }, { multi: true }).exec();
  next();
});

module.exports = mongoose.model("Event", eventSchema);
