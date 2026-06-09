const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Habit = require("./models/Habit");
const User = require("./models/User");
const auth = require("./middleware/auth");

const app = express();

// =====================
// MIDDLEWARE
// =====================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// =====================
// HOME
// =====================

app.get("/", (req, res) => {
  res.send("Rohit's Habit Tracker API");
});

// =====================
// HABITS
// =====================

// GET habits (user-specific)
app.get("/api/habits", auth, async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user.userId,
    });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE habit
app.post("/api/habits", auth, async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newHabit = await Habit.create({
      title: req.body.title,
      completed: false,
      xp: 0,
      level: 1,
      streak: 0,
      lastCompletedDate: null,
      badges: [],
      userId: req.user.userId,
    });

    res.json(newHabit);
  } catch (err) {
    console.log("POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE habit
app.delete("/api/habits/:id", auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// UPDATE (FIXED + GAMIFICATION)
// =====================

app.put("/api/habits/:id", auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const today = new Date().toDateString();

    // EDIT MODE
    if (req.body && req.body.title) {
      habit.title = req.body.title;
    }
    // TOGGLE MODE
    else {
      habit.completed = !habit.completed;

      if (habit.completed) {
        habit.xp += 10;

        // ======================
        // STREAK SYSTEM
        // ======================

        if (habit.lastCompletedDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          const isConsecutive =
            habit.lastCompletedDate === yesterday.toDateString();

          if (isConsecutive) {
            habit.streak += 1;
          } else {
            habit.streak = 1;
          }

          habit.lastCompletedDate = today;
        }

        // ======================
        // BADGES
        // ======================

        if (!habit.badges.includes("First Step") && habit.xp >= 10) {
          habit.badges.push("First Step");
        }

        if (!habit.badges.includes("Consistency") && habit.streak >= 5) {
          habit.badges.push("Consistency (5 Day Streak)");
        }

        if (!habit.badges.includes("Riser") && habit.level >= 5) {
          habit.badges.push("Riser (Level 5)");
        }
      } else {
        habit.xp = Math.max(0, habit.xp - 10);
      }

      habit.level = Math.floor(habit.xp / 50) + 1;
    }

    const updated = await habit.save();
    res.json(updated);
  } catch (err) {
    console.log("PUT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// AUTH
// =====================

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user._id,
      username: user.username,
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================
// START SERVER
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