const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

// GET all favorites
router.get("/", async (req, res) => {
  const db = await connectDB();
  const tvFavs = await db.collection("tvshows").find({ favorite: true }).toArray();
  const chFavs = await db.collection("channels").find({ favorite: true }).toArray();
  res.json({ tvFavs, chFavs });
});

// DELETE favorite (unmark)
router.delete("/:type/:id", async (req, res) => {
  const db = await connectDB();
  const { type, id } = req.params;

  const collection = type === "tvshow" ? "tvshows" : "channels";
  const result = await db.collection(collection).updateOne(
    { _id: new ObjectId(id) },
    { $set: { favorite: false } }
  );

  if (result.matchedCount === 0) return res.status(404).json({ error: "Item not found" });
  res.json({ message: "Removed from favorites" });
});

module.exports = router;
