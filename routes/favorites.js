const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

// =======================
// GET all favorites
// =======================
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    
    // Fetch favorites from all three collections
    const movieFavs = await db.collection("movies").find({ favorite: true }).toArray();
    const tvFavs = await db.collection("tvshows").find({ favorite: true }).toArray();
    const chFavs = await db.collection("channels").find({ favorite: true }).toArray();
    
    res.json({ 
      movieFavs, 
      tvFavs, 
      chFavs,
      total: movieFavs.length + tvFavs.length + chFavs.length
    });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================
// DELETE favorite (unmark)
// =======================
router.delete("/:type/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { type, id } = req.params;

    // Determine collection based on type
    let collection;
    if (type === "movie") {
      collection = "movies";
    } else if (type === "tvshow") {
      collection = "tvshows";
    } else if (type === "channel") {
      collection = "channels";
    } else {
      return res.status(400).json({ error: "Invalid type. Must be 'movie', 'tvshow', or 'channel'" });
    }

    // Update the item to unfavorite it
    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      { $set: { favorite: false } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(400).json({ error: "Invalid ID format or Server error" });
  }
});

module.exports = router;