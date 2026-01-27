require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

/* ---------- DATABASE ---------- */
connectDB(); // Connect to MongoDB

/* ---------- API ROUTES ---------- */
app.use("/api/movies", require("./routes/movies"));
app.use("/api/tvshows", require("./routes/tvshows"));
app.use("/api/channels", require("./routes/channels"));
app.use("/api/favorites", require("./routes/favorites")); // NEW: Favorites CRUD

/* ---------- FRONTEND PAGES ---------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/tvshows", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tvshows.html"));
});

app.get("/channels", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "channels.html"));
});

app.get("/favorites", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favorites.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

/* ---------- ERROR HANDLING ---------- */

// API 404
app.use("/api/", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Frontend 404
app.use((req, res) => {
  res.status(404).send("<h2>404 - Page Not Found</h2><a href='/'>Go Home</a>");
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
