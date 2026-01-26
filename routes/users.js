const express = require("express");
const router = express.Router();
const userModel = require("../movieModel"); // Здесь лежат функции USERS CRUD

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    let result = [...users];
    const { name, email, sortBy, order, fields } = req.query;

    // Filtering
    if (name) result = result.filter(u => u.name && u.name.toLowerCase().includes(name.toLowerCase()));
    if (email) result = result.filter(u => u.email && u.email.toLowerCase().includes(email.toLowerCase()));

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
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// POST create user
router.post("/", async (req, res) => {
  try {
    const { name, email, favouriteGenres } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Missing required fields: name, email" });

    const createdAt = new Date().toISOString();
    const id = await userModel.addUser({ 
      name, 
      email, 
      favouriteGenres: favouriteGenres || [], 
      createdAt 
    });

    res.status(201).json({ id, name, email, favouriteGenres, createdAt });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  try {
    const { name, email, favouriteGenres } = req.body;
    const changes = await userModel.updateUser(req.params.id, { name, email, favouriteGenres });

    if (changes === 0) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User updated" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const changes = await userModel.deleteUser(req.params.id);
    if (changes === 0) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

module.exports = router;