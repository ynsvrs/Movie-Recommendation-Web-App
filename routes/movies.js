// routes/movies.js
const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");
const { requireAdmin } = require("../middleware/auth");

// GET all movies
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { title, genre, minRating, sortBy, order } = req.query;
    let query = {};
    if (title) query.title = { $regex: title, $options: "i" };
    if (genre) query.genre = genre;
    if (minRating) query.rating = { $gte: Number(minRating) };
    let cursor = db.collection("movies").find(query);
    if (sortBy) cursor = cursor.sort({ [sortBy]: order === "desc" ? -1 : 1 });
    let movies = await cursor.toArray();
    if (req.session.user) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(req.session.user._id) });
      const favIds = (user.favorites.movies || []).map(id => id.toString());
      const watIds = (user.watched.movies || []).map(id => id.toString());
      movies = movies.map(m => ({
        ...m,
        isFavorite: favIds.includes(m._id.toString()),
        isWatched: watIds.includes(m._id.toString())
      }));
    }
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET movie by ID
router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    let movie = await db.collection("movies").findOne({ _id: new ObjectId(req.params.id) });
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    if (req.session.user) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(req.session.user._id) });
      const favIds = (user.favorites.movies || []).map(id => id.toString());
      const watIds = (user.watched.movies || []).map(id => id.toString());
      movie = {
        ...movie,
        isFavorite: favIds.includes(movie._id.toString()),
        isWatched: watIds.includes(movie._id.toString())
      };
    }
    res.json(movie);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// CREATE movie
router.post("/", requireAdmin, async (req, res) => {
  const { title, genre, year, rating, poster, description } = req.body;
  if (!title || !genre) return res.status(400).json({ error: "Title & genre required" });
  try {
    const db = await connectDB();
    const result = await db.collection("movies").insertOne({
      title,
      genre,
      year: Number(year) || null,
      rating: Number(rating) || 0,
      poster: poster || "/images/default_movie.jpg",
      description: description || ""
    });
    res.status(201).json({ _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE movie
router.put("/:id", requireAdmin, async (req, res) => {
  const updates = req.body;
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No updates provided" });
  try {
    const db = await connectDB();
    const result = await db.collection("movies").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Movie not found" });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID or Server error" });
  }
});

// DELETE movie
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("movies").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Movie not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

module.exports = router;