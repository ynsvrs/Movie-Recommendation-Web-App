const express = require("express");
const router = express.Router();
const db = require("../db"); 


// GET all users 
router.get("/", (req, res) => {
  db.all("SELECT * FROM users", (err, users) => {
    if (err) return res.status(500).json({ error: "Database error" });

    let result = [...users];
    const { name, email, sortBy, order, fields } = req.query;

    // Filtering
    if (name) result = result.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
    if (email) result = result.filter(u => u.email.toLowerCase().includes(email.toLowerCase()));

    // Sorting
    if (sortBy) {
      const sortOrder = order === "desc" ? -1 : 1;
      result.sort((a, b) => (a[sortBy] < b[sortBy] ? -1 * sortOrder : a[sortBy] > b[sortBy] ? 1 * sortOrder : 0));
    }

    // Projection
    if (fields) {
      const selectedFields = fields.split(",");
      result = result.map(u => {
        const obj = {};
        selectedFields.forEach(f => {
          if (u[f] !== undefined) obj[f] = u[f];
        });
        return obj;
      });
    }

    res.status(200).json(result);
  });
});

// GET user by ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  });
});

// POST create user
router.post("/", (req, res) => {
  const { name, email, favouriteGenres } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Missing required fields: name, email" });

  const createdAt = new Date().toISOString();
  db.run(
    "INSERT INTO users (name, email, favouriteGenres, createdAt) VALUES (?, ?, ?, ?)",
    [name, email, favouriteGenres || "", createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.status(201).json({ id: this.lastID, name, email, favouriteGenres, createdAt });
    }
  );
});

// PUT update user
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, email, favouriteGenres } = req.body;
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  if (!name || !email) return res.status(400).json({ error: "Missing required fields: name, email" });

  db.run(
    "UPDATE users SET name = ?, email = ?, favouriteGenres = ? WHERE id = ?",
    [name, email, favouriteGenres || "", id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      if (this.changes === 0) return res.status(404).json({ error: "User not found" });
      res.status(200).json({ message: "User updated" });
    }
  );
});

// DELETE user
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted" });
  });
});

module.exports = router;
