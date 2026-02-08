const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { ObjectId } = require("mongodb");
const { requireAdmin } = require("../middleware/auth");

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
    if (sortBy) {
      cursor = cursor.sort({ [sortBy]: order === "desc" ? -1 : 1 });
    }
    let channels = await cursor.toArray();
    if (req.session.user) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(req.session.user._id) });
      const favIds = (user.favorites.channels || []).map(id => id.toString());
      const watIds = (user.watched.channels || []).map(id => id.toString());
      channels = channels.map(ch => ({
        ...ch,
        isFavorite: favIds.includes(ch._id.toString()),
        isWatched: watIds.includes(ch._id.toString())
      }));
    }
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET channel by ID
router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    let channel = await db.collection("channels").findOne({ _id: new ObjectId(req.params.id) });
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    if (req.session.user) {
      const user = await db.collection("users").findOne({ _id: new ObjectId(req.session.user._id) });
      const favIds = (user.favorites.channels || []).map(id => id.toString());
      const watIds = (user.watched.channels || []).map(id => id.toString());
      channel = {
        ...channel,
        isFavorite: favIds.includes(channel._id.toString()),
        isWatched: watIds.includes(channel._id.toString())
      };
    }
    res.json(channel);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// CREATE channel
router.post("/", requireAdmin, async (req, res) => {
  const { name, country, category, logo, description } = req.body;
  if (!name || !category) return res.status(400).json({ error: "Name & category required" });
  try {
    const db = await connectDB();
    const result = await db.collection("channels").insertOne({
      name,
      country: country || "N/A",
      category,
      logo: logo || "/images/default_channel.jpg",
      description: description || ""
    });
    res.status(201).json({ _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE channel
router.put("/:id", requireAdmin, async (req, res) => {
  const updates = req.body;
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No updates provided" });
  try {
    const db = await connectDB();
    const result = await db.collection("channels").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Channel not found" });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID or Server error" });
  }
});

// DELETE channel
router.delete("/:id", requireAdmin, async (req, res) => {
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