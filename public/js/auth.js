const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }
  try {
    const db = await connectDB();
    const existing = await db.collection("users").findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ error: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashed,
      role: 'user',
      createdAt: new Date(),
      favorites: { movies: [], tvshows: [], channels: [] },
      watched: { movies: [], tvshows: [], channels: [] }
    });
    req.session.user = { _id: result.insertedId.toString(), username, role: 'user' };
    res.json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: "All fields required" });
  }
  try {
    const db = await connectDB();
    const user = await db.collection("users").findOne({ $or: [{ username: login }, { email: login }] });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    req.session.user = { _id: user._id.toString(), username: user.username, role: user.role };
    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("movierec.sid");
    res.json({ message: "Logged out" });
  });
});

// GET ME
router.get("/me", (req, res) => {
  if (req.session.user) {
    return res.json({ username: req.session.user.username, role: req.session.user.role });
  }
  res.json({});
});

// CHECK AUTH
router.get("/check", (req, res) => {
  res.json({
    authenticated: !!req.session.user,
    user: req.session.user ? { username: req.session.user.username, role: req.session.user.role } : null
  });
});

module.exports = router; 