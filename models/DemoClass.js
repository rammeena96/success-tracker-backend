const mongoose = require("mongoose");

const demoClassSchema = new mongoose.Schema({
  pname: String,
  phone: String,
  grade: String,
  subject: String,
  board: String,
  area: String,
  msg: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DemoClass", demoClassSchema);