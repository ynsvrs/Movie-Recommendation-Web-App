const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

// GET all TV shows
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { title, genre, sortBy, order } = req.query;

    let query = {};
    if (title) query.title = { $regex: title, $options: "i" };
    if (genre) query.genre = genre;

    // projection
    let cursor = db.collection("tvshows")
      .find(query)
      .project({ title: 1, poster: 1, _id: 1 }); 

    if (sortBy) cursor = cursor.sort({ [sortBy]: order === "desc" ? -1 : 1 });

    const shows = await cursor.toArray();
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE TV Show 
router.post("/", async (req, res) => {
  const { title, genre, seasons, year, rating, poster, description } = req.body;
  if (!title || !genre) return res.status(400).json({ error: "Title & genre required" });

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
});

// UPDATE TV Show 
router.put("/:id", async (req, res) => {
  const db = await connectDB();
  const { favorite, watched } = req.body;

  const result = await db.collection("tvshows").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { favorite, watched } }
  );

  if (result.matchedCount === 0) return res.status(404).json({ error: "TV show not found" });
  res.json({ message: "Updated successfully" });
});

// DELETE TV Show 
router.delete("/:id", async (req, res) => {
  const db = await connectDB();
  const result = await db.collection("tvshows").deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "TV show not found" });
  res.json({ message: "Deleted successfully" });
});

module.exports = router;
