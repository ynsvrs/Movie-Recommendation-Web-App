require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images"))); // ✅ ADDED LINE

/* ---------- DATABASE ---------- */
connectDB(); 

/* ---------- API ROUTES ---------- */
app.use("/api/movies", require("./routes/movies"));
app.use("/api/tvshows", require("./routes/tvshows"));
app.use("/api/channels", require("./routes/channels"));
app.use("/api/favorites", require("./routes/favorites"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/movies", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "movies.html"));
});

app.get("/tvshows", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tvshows.html"));
});

app.get("/channels", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "channels.html"));
});

app.get("/tickets", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tickets.html"));
});

app.get("/favorites", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favorites.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.get("/api/stats", async (req, res) => {
  try {
    const db = await connectDB();
    const moviesCount = await db.collection("movies").countDocuments();
    const showsCount = await db.collection("tvshows").countDocuments();
    res.json({ moviesCount, showsCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* ---------- ERROR HANDLING ---------- */
app.use("/api/", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.use((req, res) => {
  res.status(404).send("<h2>404 - Page Not Found</h2><p>The page you are looking for doesn't exist.</p><a href='/'>Go Home</a>");
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
