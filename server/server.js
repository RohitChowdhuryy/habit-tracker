const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Habit = require("./models/Habit");

const app = express();

// =====================
// MIDDLEWARE (FIXED)
// =====================

// IMPORTANT: allow frontend (Vercel) to access backend
app.use(
  cors({
    origin: "*", // (simple + works for deployment)
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// =====================
// ROUTES
// =====================

// Home route
app.get("/", (req, res) => {
  res.send("Rohit's Habit Tracker API");
});

// GET all habits
app.get("/api/habits", async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE habit
app.post("/api/habits", async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newHabit = await Habit.create({
      title: req.body.title,
      completed: false,
    });

    res.json(newHabit);
  } catch (err) {
    console.log("POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE habit
app.delete("/api/habits/:id", async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (TOGGLE + EDIT FIXED)
app.put("/api/habits/:id", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // EDIT mode
    if (req.body && req.body.title) {
      habit.title = req.body.title;
    }
    // TOGGLE mode
    else {
      habit.completed = !habit.completed;
    }

    const updated = await habit.save();
    res.json(updated);

  } catch (err) {
    console.log("PUT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// CONNECT DB + START
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("DB ERROR:", err));