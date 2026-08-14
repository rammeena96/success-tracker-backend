const mongoose = require("mongoose");

const parentRegistrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    parentName: {
      type: String,
      required: true,
      trim: true,
    },

    parentMobile: {
      type: String,
      required: true,
      trim: true,
    },

    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
  type: String,
  required: false,
  trim: true,
  lowercase: true,
  default: "",
},

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    studentClass: {
      type: String,
      required: true,
      trim: true,
    },

    board: {
      type: String,
      required: true,
      trim: true,
    },

    schoolName: {
      type: String,
      required: true,
      trim: true,
    },

    subjects: {
      type: String,
      required: true,
      trim: true,
    },

    tuitionMode: {
      type: String,
      required: true,
      trim: true,
    },

    preferredTime: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },

    pinCode: {
      type: String,
      required: true,
      trim: true,
    },

    tutorGender: {
      type: String,
      required: true,
      trim: true,
    },

    tutorExperiencePreference: {
      type: String,
      required: true,
      trim: true,
    },

    additionalRequirements: {
      type: String,
      trim: true,
      default: "",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    registrationStatus: {
      type: String,
      enum: ["Received", "Confirmed", "Cancelled"],
      default: "Received",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ParentRegistration",
  parentRegistrationSchema
);