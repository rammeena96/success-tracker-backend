
console.log("MY SERVER FILE LOADED");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Teacher = require("./models/Teacher");
const DemoClass = require("./models/DemoClass");
const ParentRegistration = require("./models/ParentRegistration");
const Counter = require("./models/Counter");
const app = express();

app.use(express.json());
app.use(cors());

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

// Parent Registration API
app.post("/api/parent-registration", async (req, res) => {
  try {
    const {
      parent_name,
      mobile_number,
      whatsapp_number,
      email,
      student_name,
      student_class,
      board,
      school_name,
      subjects_required,
      tuition_mode,
      preferred_time,
      jaipur_area,
      full_address,
      pin_code,
      tutor_gender_preference,
      tutor_experience_preference,
      tutor_preference_notes,
    } = req.body;

    // Basic required-field validation
    if (
      !parent_name ||
      !mobile_number ||
      !whatsapp_number ||
      !email ||
      !student_name ||
      !student_class ||
      !board ||
      !school_name ||
      !subjects_required ||
      !tuition_mode ||
      !preferred_time ||
      !jaipur_area ||
      !full_address ||
      !pin_code ||
      !tutor_gender_preference ||
      !tutor_experience_preference
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Get next registration number
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

    // Save parent registration
    const data = await ParentRegistration.create({
      registrationId,

      parentName: parent_name,
      parentMobile: mobile_number,
      whatsappNumber: whatsapp_number,
      email,

      studentName: student_name,
      studentClass: student_class,
      board,
      schoolName: school_name,
      subjects: subjects_required,

      tuitionMode: tuition_mode,
      preferredTime: preferred_time,
      area: jaipur_area,
      fullAddress: full_address,
      pinCode: pin_code,

      tutorGender: tutor_gender_preference,
      tutorExperiencePreference: tutor_experience_preference,
      additionalRequirements: tutor_preference_notes || "",

      paymentStatus: "Pending",
      registrationStatus: "Received",
    });

    res.status(201).json({
      success: true,
      message: "Parent registration received successfully.",
      registrationId: data.registrationId,
      data,
    });
  } catch (error) {
    console.error("Parent Registration Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to save parent registration.",
      error: error.message,
    });
  }
});

// Test Routes
app.get("/test-teacher", (req, res) => {
  res.send("Teacher Route Loaded");
});

app.get("/test-demo", (req, res) => {
  res.send("Demo Route Loaded");
});

// Home Route
app.get("/api/admin/stats", async (req, res) => {
  try {
    const counsellings = await Counselling.countDocuments();
    const teachers = await Teacher.countDocuments();
    const democlasses = await DemoClass.countDocuments();

    res.json({
      success: true,
      counsellings,
      teachers,
      democlasses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// Admin CRM APIs

app.get("/api/admin/counsellings", async (req, res) => {
  try {
    const data = await Counselling.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Counselling Status
app.patch("/api/admin/counselling/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Counselling.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      data: updated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
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