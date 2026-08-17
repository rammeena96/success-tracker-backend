
console.log("MY SERVER FILE LOADED");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Teacher = require("./models/Teacher");
const DemoClass = require("./models/DemoClass");
const ParentRegistration = require("./models/ParentRegistration");
const Counter = require("./models/Counter");
const app = express();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(express.json());
app.use(cors());
// Razorpay Order API
app.post("/api/create-payment-order", async (req, res) => {
  try {
    const options = {
      amount: 99 * 100, // ₹99 in paise
      currency: "INR",
      receipt: "ST-" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create payment order.",
    });
  }
});
// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed ❌");
    console.error(err);
  });

// Counselling Model
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

const Counselling = mongoose.model("Counselling", counsellingSchema);

// Counselling API
app.post("/api/counselling", async (req, res) => {
  try {
    const data = await Counselling.create(req.body);

    res.status(201).json({
      success: true,
      message: "Counselling Request Saved",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Teacher API
app.post("/api/teacher", async (req, res) => {
  try {
    const data = await Teacher.create(req.body);

    res.status(201).json({
      success: true,
      message: "Teacher Registration Saved",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Demo Class API
app.post("/api/demo-class", async (req, res) => {
  try {
    const data = await DemoClass.create(req.body);

    res.status(201).json({
      success: true,
      message: "Demo Class Request Saved",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Razorpay Payment Verification API
app.post("/api/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
});
// Parent Registration API
app.post("/api/parent-registration", async (req, res) => {
  try {
    const {
      parentName,
      parentMobile,
      whatsappNumber,
      email,
      studentName,
      studentClass,
      board,
      schoolName,
      subjects,
      tuitionMode,
      preferredTime,
      area,
      fullAddress,
      pinCode,
      tutorGender,
      tutorExperiencePreference,
      additionalRequirements,
    } = req.body;

    // Required fields
    if (
      !parentName ||
      !parentMobile ||
      !whatsappNumber ||
      !studentName ||
      !studentClass ||
      !board ||
      !schoolName ||
      !subjects ||
      !tuitionMode ||
      !preferredTime ||
      !area ||
      !fullAddress ||
      !pinCode ||
      !tutorGender ||
      !tutorExperiencePreference
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Generate registration number
    const counter = await Counter.findOneAndUpdate(
      { name: "parent_registration" },
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const registrationId = `ST-P-${String(counter.seq).padStart(6, "0")}`;

    // Save registration
    const data = await ParentRegistration.create({
      registrationId,

      parentName,
      parentMobile,
      whatsappNumber,
      email: email || "",

      studentName,
      studentClass,
      board,
      schoolName,

      subjects,
      tuitionMode,
      preferredTime,

      area,
      fullAddress,
      pinCode,

      tutorGender,
      tutorExperiencePreference,
      additionalRequirements: additionalRequirements || "",

      paymentStatus: "Pending",
      registrationStatus: "Received",
    });

    return res.status(201).json({
      success: true,
      message: "Parent registration received successfully.",
      registrationId: data.registrationId,
      data,
    });

  } catch (error) {
    console.error("Parent Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save parent registration.",
      error: error.message,
    });
  }
});

app.get("/api/admin/teachers", async (req, res) => {
  try {
    const data = await Teacher.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/democlasses", async (req, res) => {
  try {
    const data = await DemoClass.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/", (req, res) => {
  res.send("Success Tracker Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});