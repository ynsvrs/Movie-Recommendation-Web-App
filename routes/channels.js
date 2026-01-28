const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

// GET all channels
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { name, country, category, sortBy, order } = req.query;

    let query = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (country) query.country = country;
    if (category) query.category = category;

    let cursor = db.collection("channels").find(query);

    if (sortBy) cursor = cursor.sort({ [sortBy]: order === "desc" ? -1 : 1 });

    const channels = await cursor.toArray();
    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET channel by ID
router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const channel = await db.collection("channels").findOne({ _id: new ObjectId(req.params.id) });
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    res.json(channel);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// CREATE channel
router.post("/", async (req, res) => {
  const { name, country, category, logo, description } = req.body;
  if (!name || !category) return res.status(400).json({ error: "Name & category required" });

  try {
    const db = await connectDB();
    const result = await db.collection("channels").insertOne({
      name,
      country: country || "N/A",
      category,
      logo: logo || "/images/default_channel.jpg",
      description: description || "",
      favorite: false,
      watched: false
    });
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE channel
router.put("/:id", async (req, res) => {
  const { favorite, watched } = req.body;
  try {
    const db = await connectDB();
    const result = await db.collection("channels").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { favorite, watched } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Channel not found" });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID or Server error" });
  }
});

// DELETE channel
router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("channels").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Channel not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

module.exports = router;
