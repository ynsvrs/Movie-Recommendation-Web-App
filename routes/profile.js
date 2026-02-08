const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");
const { requireUser } = require("../middleware/auth");

// GET user profile
router.get("/", requireUser, async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.session.user._id) },
      { projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET user lists (favorites and watched)
router.get("/lists", requireUser, async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection("users").findOne({ _id: new ObjectId(req.session.user._id) });
    if (!user) return res.status(404).json({ error: "User not found" });
    const favorites = user.favorites || { movies: [], tvshows: [], channels: [] };
    const watched = user.watched || { movies: [], tvshows: [], channels: [] };
    // Fetch full details
    const movieFavIds = favorites.movies.map(id => new ObjectId(id));
    const tvFavIds = favorites.tvshows.map(id => new ObjectId(id));
    const chFavIds = favorites.channels.map(id => new ObjectId(id));
    const movieWatIds = watched.movies.map(id => new ObjectId(id));
    const tvWatIds = watched.tvshows.map(id => new ObjectId(id));
    const chWatIds = watched.channels.map(id => new ObjectId(id));
    const favMovies = await db.collection("movies").find({ _id: { $in: movieFavIds } }).toArray();
    const favTvshows = await db.collection("tvshows").find({ _id: { $in: tvFavIds } }).toArray();
    const favChannels = await db.collection("channels").find({ _id: { $in: chFavIds } }).toArray();
    const watMovies = await db.collection("movies").find({ _id: { $in: movieWatIds } }).toArray();
    const watTvshows = await db.collection("tvshows").find({ _id: { $in: tvWatIds } }).toArray();
    const watChannels = await db.collection("channels").find({ _id: { $in: chWatIds } }).toArray();
    res.json({
      favorites: { movies: favMovies, tvshows: favTvshows, channels: favChannels },
      watched: { movies: watMovies, tvshows: watTvshows, channels: watChannels }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADD/REMOVE favorite
router.post("/favorites/:type/:id", requireUser, async (req, res) => {
  const { type, id } = req.params;
  if (!["movies", "tvshows", "channels"].includes(type)) return res.status(400).json({ error: "Invalid type" });
  try {
    const db = await connectDB();
    const collection = type === "movies" ? "movies" : type === "tvshows" ? "tvshows" : "channels";
    const item = await db.collection(collection).findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ error: "Item not found" });
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.session.user._id) },
      { $addToSet: { [`favorites.${type}`]: id } }
    );
    res.json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/favorites/:type/:id", requireUser, async (req, res) => {
  const { type, id } = req.params;
  if (!["movies", "tvshows", "channels"].includes(type)) return res.status(400).json({ error: "Invalid type" });
  try {
    const db = await connectDB();
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.session.user._id) },
      { $pull: { [`favorites.${type}`]: id } }
    );
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADD/REMOVE watched
router.post("/watched/:type/:id", requireUser, async (req, res) => {
  const { type, id } = req.params;
  if (!["movies", "tvshows", "channels"].includes(type)) return res.status(400).json({ error: "Invalid type" });
  try {
    const db = await connectDB();
    const collection = type === "movies" ? "movies" : type === "tvshows" ? "tvshows" : "channels";
    const item = await db.collection(collection).findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ error: "Item not found" });
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.session.user._id) },
      { $addToSet: { [`watched.${type}`]: id } }
    );
    res.json({ message: "Added to watched" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/watched/:type/:id", requireUser, async (req, res) => {
  const { type, id } = req.params;
  if (!["movies", "tvshows", "channels"].includes(type)) return res.status(400).json({ error: "Invalid type" });
  try {
    const db = await connectDB();
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.session.user._id) },
      { $pull: { [`watched.${type}`]: id } }
    );
    res.json({ message: "Removed from watched" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE profile
router.put("/", requireUser, async (req, res) => {
  const { username, email } = req.body;
  const updates = {};
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No fields to update" });
  try {
    const db = await connectDB();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(req.session.user._id) },
      { $set: updates }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;