const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  phone: String,
  qualification: String,
  subjects: String,
  classes: String,
  experience: String,
  area: String,
  boards: String,
  about: String,
  verified: {
  type: Boolean,
  default: false,
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);