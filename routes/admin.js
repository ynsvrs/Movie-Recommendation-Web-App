const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { requireAdmin } = require("../middleware/auth");

// GET /api/admin/stats - sny statistics
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    console.log("📊 Fetching admin stats...");
    
    const db = await connectDB();
    
    const users = await db.collection("users").countDocuments();
    const movies = await db.collection("movies").countDocuments();
    const tvshows = await db.collection("tvshows").countDocuments();
    const channels = await db.collection("channels").countDocuments();

    console.log("✅ Stats:", { users, movies, tvshows, channels });

    res.json({ users, movies, tvshows, channels });
  } catch (err) {
    console.error("❌ Stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;