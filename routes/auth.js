const express = require("express");
const bcrypt = require("bcrypt");
const connectDB = require("../db");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const db = await connectDB();
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.user = {
    id: user._id,
    role: user.role
  };

  res.json({ message: "Login successful" });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("movierec.sid");
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
