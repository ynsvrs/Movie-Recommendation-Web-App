require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const connectDB = require("./db");
const MongoStore = require("connect-mongo").default;


const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- SAFETY CHECK ---------- */
if (!process.env.SESSION_SECRET) {
  console.error("❌ SESSION_SECRET missing in .env");
  process.exit(1);
}

/* ---------- DATABASE ---------- */
connectDB();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
session({
    name: "movierec.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),

    cookie: {
        httpOnly: true,
        secure: false, // true after deploy HTTPS
        maxAge: 1000 * 60 * 60
    }
})
);


/* ---------- STATIC FILES ---------- */
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

/* ---------- API ROUTES ---------- */
app.use("/api/movies", require("./routes/movies"));
app.use("/api/tvshows", require("./routes/tvshows"));
app.use("/api/channels", require("./routes/channels"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/auth", require("./routes/auth"));


/* ---------- PAGES ---------- */
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.get("/movies", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "movies.html"))
);

app.get("/tvshows", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "tvshows.html"))
);

app.get("/channels", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "channels.html"))
);

app.get("/tickets", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "tickets.html"))
);

app.get("/favorites", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "favorites.html"))
);

app.get("/about", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "about.html"))
);

app.get("/contact", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "contact.html"))
);

/* ---------- API STATS ---------- */
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

/* ---------- ERRORS ---------- */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.use((req, res) => {
  res.status(404).send(`
    <h2>404 - Page Not Found</h2>
    <a href="/">Go Home</a>
  `);
});

/* ---------- START ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
