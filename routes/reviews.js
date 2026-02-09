const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../db");
const { requireUser } = require("../middleware/auth");

const router = express.Router();

const ALLOWED_TARGETS = new Set(["movie", "tvshow", "channel"]);
const ALLOWED_SORT = new Set(["createdAt", "rating"]);

function toId(v) {
  return ObjectId.isValid(v) ? new ObjectId(v) : null;
}

function targetCollection(targetType) {
  if (targetType === "movie") return "movies";
  if (targetType === "tvshow") return "tvshows";
  if (targetType === "channel") return "channels";
  return null;
}

// CREATE review
router.post("/", requireUser, async (req, res) => {
  try {
    const db = await connectDB();
    const { targetType, targetId, rating, text } = req.body;

    if (!ALLOWED_TARGETS.has(targetType)) {
      return res.status(400).json({ error: "Invalid targetType" });
    }

    const tId = toId(targetId);
    if (!tId) return res.status(400).json({ error: "Invalid targetId" });

    const r = Number(rating);
    if (Number.isNaN(r) || r < 1 || r > 10) {
      return res.status(400).json({ error: "Rating must be 1..10" });
    }

    const col = targetCollection(targetType);
    const target = await db.collection(col).findOne({ _id: tId });
    if (!target) return res.status(404).json({ error: "Target not found" });

    const userId = req.session.user._id; // string
    const username = req.session.user.username || "user";

    // one review per user per target
    const exists = await db.collection("reviews").findOne({
      userId: new ObjectId(userId),
      targetType,
      targetId: tId
    });
    if (exists) {
      return res.status(409).json({ error: "You already reviewed this item" });
    }

    const doc = {
      userId: new ObjectId(userId),
      username,
      targetType,
      targetId: tId,
      targetTitle: target.title || target.name || "Untitled",
      rating: r,
      text: (text || "").trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("reviews").insertOne(doc);
    res.status(201).json({ message: "Review created", reviewId: result.insertedId });
  } catch (err) {
    console.error("POST /api/reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET reviews (filter + sort + pagination)
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const {
      targetType,
      targetId,
      minRating,
      search,
      page = 1,
      limit = 6,
      sortBy = "createdAt",
      order = "desc",
      my = "false"
    } = req.query;

    const query = {};

    if (targetType) {
      if (!ALLOWED_TARGETS.has(targetType)) {
        return res.status(400).json({ error: "Invalid targetType" });
      }
      query.targetType = targetType;
    }

    if (targetId) {
      const tId = toId(targetId);
      if (!tId) return res.status(400).json({ error: "Invalid targetId" });
      query.targetId = tId;
    }

    if (minRating !== undefined) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search) {
      query.$or = [
        { text: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { targetTitle: { $regex: search, $options: "i" } }
      ];
    }

    if (my === "true") {
      if (!req.session?.user?._id) return res.status(401).json({ error: "Unauthorized" });
      query.userId = new ObjectId(req.session.user._id);
    }

    const safeSort = ALLOWED_SORT.has(sortBy) ? sortBy : "createdAt";
    const safeOrder = order === "asc" ? 1 : -1;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 6, 1), 50);
    const skip = (p - 1) * l;

    const [data, total] = await Promise.all([
      db.collection("reviews")
        .find(query)
        .sort({ [safeSort]: safeOrder })
        .skip(skip)
        .limit(l)
        .toArray(),
      db.collection("reviews").countDocuments(query)
    ]);

    res.json({
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
      data
    });
  } catch (err) {
    console.error("GET /api/reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE review (owner or admin)
router.patch("/:id", requireUser, async (req, res) => {
  try {
    const db = await connectDB();
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid review id" });

    const review = await db.collection("reviews").findOne({ _id: id });
    if (!review) return res.status(404).json({ error: "Review not found" });

    const isOwner = String(review.userId) === String(req.session.user._id);
    const isAdmin = req.session.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    const set = { updatedAt: new Date() };

    if (req.body.text !== undefined) set.text = String(req.body.text).trim();

    if (req.body.rating !== undefined) {
      const r = Number(req.body.rating);
      if (Number.isNaN(r) || r < 1 || r > 10) {
        return res.status(400).json({ error: "Rating must be 1..10" });
      }
      set.rating = r;
    }

    await db.collection("reviews").updateOne({ _id: id }, { $set: set });
    res.json({ message: "Review updated" });
  } catch (err) {
    console.error("PATCH /api/reviews/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE review (owner or admin)
router.delete("/:id", requireUser, async (req, res) => {
  try {
    const db = await connectDB();
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid review id" });

    const review = await db.collection("reviews").findOne({ _id: id });
    if (!review) return res.status(404).json({ error: "Review not found" });

    const isOwner = String(review.userId) === String(req.session.user._id);
    const isAdmin = req.session.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    await db.collection("reviews").deleteOne({ _id: id });
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("DELETE /api/reviews/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
