require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const connectDB = require("./db");
const MongoStore = require("connect-mongo").default;
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  console.error("❌ SESSION_SECRET missing in .env");
  process.exit(1);
}

connectDB();
//sessionnnn
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "movierec.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: false, 
      maxAge: 1000 * 60 * 60,
      sameSite: "lax"
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// API ROUTES - MUST COME BEFORE ERROR HANDLERS!
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));  
app.use("/api/channels", require("./routes/channels"));
app.use("/api/movies", require("./routes/movies"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/tvshows", require("./routes/tvshows"));

// API STATS 
app.get("/api/stats", async (req, res) => {
  try {
    const db = await connectDB();
    const moviesCount = await db.collection("movies").countDocuments();
    const showsCount = await db.collection("tvshows").countDocuments();
    res.json({ moviesCount, showsCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// PAGE ROUTES
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/about.html", (req, res) => res.sendFile(path.join(__dirname, "public", "about.html")));
app.get("/channels.html", (req, res) => res.sendFile(path.join(__dirname, "public", "channels.html")));
app.get("/contact.html", (req, res) => res.sendFile(path.join(__dirname, "public", "contact.html")));
app.get("/favorites.html", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "public", "favorites.html"));
});
app.get("/login.html", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/movies.html", (req, res) => res.sendFile(path.join(__dirname, "public", "movies.html")));
app.get("/profile.html", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});
app.get("/register.html", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/tvshows.html", (req, res) => res.sendFile(path.join(__dirname, "public", "tvshows.html")));

// ERROR HANDLERS
// Catch-all for undefined API routes
app.use("/api", (req, res) => {
  console.log("❌ 404 API route:", req.originalUrl);
  res.status(404).json({ error: "API route not found" });
});

// Catch-all for undefined pages
app.use((req, res) => {
  res.status(404).send(`<h2>404 - Page Not Found</h2><a href="/">Go Home</a>`);
});

app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));