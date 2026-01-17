const express = require("express");
const router = express.Router();
const movieModel = require("../movieModel");

// GET all movies
router.get("/", (req, res) => {
  movieModel.getAllMovies((err, movies) => {
    if (err) return res.status(500).json({ error: "Database error" });

    let result = [...movies];
    const { genre, minRating, sortBy, order, fields } = req.query;

    // Filtering
    if (genre) result = result.filter(m => m.genre.toLowerCase() === genre.toLowerCase());
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
  });
});

// GET movie by ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  movieModel.getMovieById(id, (err, movie) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.status(200).json(movie);
  });
});

// POST create movie
router.post("/", (req, res) => {
  const { title, genre, rating } = req.body;
  if (!title || !genre) return res.status(400).json({ error: "Missing required fields: title, genre" });

  movieModel.addMovie({ title, genre, rating }, (err, id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(201).json({ id, title, genre, rating: rating || null });
  });
});

// PUT update movie
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, genre, rating } = req.body;
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  if (!title || !genre) return res.status(400).json({ error: "Missing required fields" });

  movieModel.updateMovie(id, { title, genre, rating }, (err, changes) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (changes === 0) return res.status(404).json({ error: "Movie not found" });
    res.status(200).json({ message: "Movie updated" });
  });
});

// DELETE movie
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  movieModel.deleteMovie(id, (err, changes) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (changes === 0) return res.status(404).json({ error: "Movie not found" });
    res.status(200).json({ message: "Movie deleted" });
  });
});

module.exports = router;
