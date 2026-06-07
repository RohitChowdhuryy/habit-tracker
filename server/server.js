const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Habit = require("./models/Habit");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
    const newHabit = await Habit.create({
      title: req.body.title,
      completed: false,
    });

    res.json(newHabit);
  } catch (err) {
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

// UPDATE (TOGGLE + EDIT FIXED CLEANLY)
app.put("/api/habits/:id", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // 🔥 SAFE CHECK (THIS FIXES YOUR ERROR)
    if (req.body && req.body.title) {
      habit.title = req.body.title;
    } else {
      habit.completed = !habit.completed;
    }

    const updated = await habit.save();

    res.json(updated);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// CONNECT DB + START SERVER
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));