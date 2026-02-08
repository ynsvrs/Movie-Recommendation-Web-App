// routes/tvshows.js
const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");
const { requireAdmin } = require("../middleware/auth");

// GET all TV shows
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { title, genre, sortBy, order } = req.query;
    let query = {};
    if (title) query.title = { $regex: title, $options: "i" };
    if (genre) query.genre = genre;
    let cursor = db.collection("tvshows").find(query);
    if (sortBy) cursor = cursor.sort({ [sortBy]: order === "desc" ? -1 : 1 });
    let shows = await cursor.toArray();
    if (req.session.user) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(req.session.user._id) });
      const favIds = (user.favorites.tvshows || []).map(id => id.toString());
      const watIds = (user.watched.tvshows || []).map(id => id.toString());
      shows = shows.map(sh => ({
        ...sh,
        isFavorite: favIds.includes(sh._id.toString()),
        isWatched: watIds.includes(sh._id.toString())
      }));
    }
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE TV Show
router.post("/", requireAdmin, async (req, res) => {
  const { title, genre, seasons, year, rating, poster, description } = req.body;
  if (!title || !genre) return res.status(400).json({ error: "Title & genre required" });
  try {
    const db = await connectDB();
    const result = await db.collection("tvshows").insertOne({
      title,
      genre,
      seasons: Number(seasons) || 1,
      year: Number(year) || null,
      rating: Number(rating) || 0,
      poster: poster || "/images/default_tvshow.jpg",
      description: description || ""
    });
    res.status(201).json({ _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE TV Show
router.put("/:id", requireAdmin, async (req, res) => {
  const updates = req.body;
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No updates provided" });
  try {
    const db = await connectDB();
    const result = await db.collection("tvshows").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "TV show not found" });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID or Server error" });
  }
});

// DELETE TV Show
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("tvshows").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "TV show not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

module.exports = router;