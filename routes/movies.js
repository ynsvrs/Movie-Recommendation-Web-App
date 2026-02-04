const express = require("express");
const router = express.Router();
const movieModel = require("../movieModel");
const requireAuth = require("../middleware/auth");


router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, genre, rating } = req.body;
    if (!title || !genre)
      return res.status(400).json({ error: "Missing required fields: title, genre" });

    const id = await movieModel.addMovie({
      title,
      genre,
      rating: Number(rating) || 0
    });

    res.status(201).json({ id, title, genre, rating });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


// GET all movies
router.get("/", async (req, res) => {
  try {
    const movies = await movieModel.getAllMovies();
    let result = [...movies];
    const { genre, minRating, sortBy, order, fields } = req.query;

    // Filtering
    if (genre) result = result.filter(m => m.genre && m.genre.toLowerCase() === genre.toLowerCase());
    if (minRating) {
      const min = Number(minRating);
      if (!isNaN(min)) result = result.filter(m => m.rating >= min);
    }

    // Sorting
    if (sortBy) {
      const sortOrder = order === "desc" ? -1 : 1;
      result.sort((a, b) => (a[sortBy] < b[sortBy] ? -1 * sortOrder : a[sortBy] > b[sortBy] ? 1 * sortOrder : 0));
    }

    // Projection
    if (fields) {
      const selectedFields = fields.split(",");
      result = result.map(m => {
        const obj = {};
        selectedFields.forEach(f => {
          if (m[f] !== undefined) obj[f] = m[f];
        });
        return obj;
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await movieModel.getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.status(200).json(movie);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// POST create movie
router.post("/", async (req, res) => {
  try {
    const { title, genre, rating } = req.body;
    if (!title || !genre) return res.status(400).json({ error: "Missing required fields: title, genre" });

    const id = await movieModel.addMovie({ title, genre, rating: Number(rating) || 0 });
    res.status(201).json({ id, title, genre, rating });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// PUT update movie
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, genre, rating } = req.body;

    const changes = await movieModel.updateMovie(req.params.id, {
      title,
      genre,
      rating
    });

    if (changes === 0)
      return res.status(404).json({ error: "Movie not found" });

    res.status(200).json({ message: "Movie updated" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID or Database error" });
  }
});


// DELETE movie
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const changes = await movieModel.deleteMovie(req.params.id);

    if (changes === 0)
      return res.status(404).json({ error: "Movie not found" });

    res.status(200).json({ message: "Movie deleted" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});


module.exports = router;