const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");
const requireAuth = require("../middleware/auth");

// =======================
// GET all TV shows (PUBLIC)
// =======================
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { title, genre, sortBy, order } = req.query;

    let query = {};
    if (title) query.title = { $regex: title, $options: "i" };
    if (genre) query.genre = genre;

    let cursor = db.collection("tvshows")
      .find(query)
      .project({
        title: 1,
        poster: 1,
        genre: 1,
        seasons: 1,
        year: 1,
        rating: 1,
        description: 1,
        favorite: 1,
        watched: 1
      });

    if (sortBy) {
      cursor = cursor.sort({ [sortBy]: order === "desc" ? -1 : 1 });
    }

    const shows = await cursor.toArray();
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// =======================
// CREATE TV Show (PROTECTED)
// =======================
router.post("/", requireAuth, async (req, res) => {
  const { title, genre, seasons, year, rating, poster, description } = req.body;

  if (!title || !genre) {
    return res.status(400).json({ error: "Title & genre required" });
  }

  try {
    const db = await connectDB();
    const result = await db.collection("tvshows").insertOne({
      title,
      genre,
      seasons: Number(seasons) || 1,
      year,
      rating,
      poster: poster || "/images/default_tvshow.jpg",
      description,
      favorite: false,
      watched: false
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// =======================
// UPDATE TV Show (PROTECTED)
// =======================
router.put("/:id", requireAuth, async (req, res) => {
  const { favorite, watched } = req.body;

  try {
    const db = await connectDB();
    const result = await db.collection("tvshows").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { favorite, watched } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "TV show not found" });
    }

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID or Server error" });
  }
});


// =======================
// DELETE TV Show (PROTECTED)
// =======================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("tvshows").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "TV show not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

module.exports = router;
