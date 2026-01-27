const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

// GET all Channels 
router.get("/", async (req, res) => {
  const db = await connectDB();
  const { name, country, sortBy, order } = req.query;

  let query = {};
  if (name) query.name = { $regex: name, $options: "i" };
  if (country) query.country = country;

  let cursor = db.collection("channels").find(query);
  if (sortBy) cursor = cursor.sort({ [sortBy]: order === "desc" ? -1 : 1 });

  const channels = await cursor.toArray();
  res.json(channels);
});

// CREATE Channel 
router.post("/", async (req, res) => {
  const { name, country, category, logo, description } = req.body;
  if (!name || !country) return res.status(400).json({ error: "Name & country required" });

  const db = await connectDB();
  const result = await db.collection("channels").insertOne({
    name,
    country,
    category,
    logo: logo || "/images/default_channel.jpg",
    description,
    favorite: false,
    watched: false
  });

  res.status(201).json({ id: result.insertedId });
});

// UPDATE Channel (favorite/watched)
router.put("/:id", async (req, res) => {
  const db = await connectDB();
  const { favorite, watched } = req.body;

  const result = await db.collection("channels").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { favorite, watched } }
  );

  if (result.matchedCount === 0) return res.status(404).json({ error: "Channel not found" });
  res.json({ message: "Updated successfully" });
});

// DELETE Channel 
router.delete("/:id", async (req, res) => {
  const db = await connectDB();
  const result = await db.collection("channels").deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Channel not found" });
  res.json({ message: "Deleted successfully" });
});

module.exports = router;
