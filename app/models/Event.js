const mongoose = require("mongoose");

const { Schema } = mongoose;

const participantSchema = new Schema(
  {
    name: String,
    email: String,
    userId: Number,
  },
  { _id: false, timestamps: true },
);

const eventSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    url: { type: String },
    price: { type: Number, required: true, min: 60 },
    description: { type: String, required: true },
    startDate: { type: Date, required: true, default: Date.now() },
    photoUrl: { type: String, required: false },
    participants: [participantSchema],
    maxParticipants: { type: Number, required: true, default: 30 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
