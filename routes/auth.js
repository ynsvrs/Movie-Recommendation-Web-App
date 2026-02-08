const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const connectDB = require("../db");

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const db = await connectDB();
    const existing = await db.collection("users").findOne({ username });
    if (existing) return res.status(400).json({ error: "Username exists" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({ username, password: hashed });

    req.session.user = { _id: result.insertedId, username };
    res.json({ message: "Registration successful", user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const db = await connectDB();
    const user = await db.collection("users").findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    req.session.user = { _id: user._id, username: user.username };
    res.json({ message: "Login successful", user: req.session.user });
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

// CHECK AUTH (ME)
router.get("/me", (req, res) => {
  if (req.session?.user) {
    return res.json({ username: req.session.user.username, _id: req.session.user._id });
  }
  res.json({});
});

module.exports = router;
