const express = require("express");
const router = express.Router();

const Counselling = require("../models/Counselling");

router.post("/", async (req, res) => {
  try {
    const data = await Counselling.create(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;