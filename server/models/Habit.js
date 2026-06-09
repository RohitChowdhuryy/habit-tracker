const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastCompletedDate: {
    type: String,
    default: null,
  },
  badges: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Habit", habitSchema);