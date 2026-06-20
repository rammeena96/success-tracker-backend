const mongoose = require("mongoose");

const counsellingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  grade: String,
  concern: String,
  status: {
  type: String,
  default: "New",
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Counselling", counsellingSchema);