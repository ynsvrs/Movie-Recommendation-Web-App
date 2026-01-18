const express = require("express");
const fs = require("fs");
const path = require("path");
const connectDB = require("./db");

const moviesRoutes = require("./routes/movies");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// Pagesss
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views/index.html")));
app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "views/about.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "views/contact.html")));

app.post("/contact", (req, res) => {
  const filePath = path.join(__dirname, "submissions.json");
  let submissions = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    if (data) submissions = JSON.parse(data);
  }
  submissions.push(req.body);
  fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
  res.send(`
    <h2>Thanks, ${req.body.name}!</h2>
    <p>Your message has been received.</p>
    <a href="/contact">Go back</a>
  `);
});

// Placeholderzz
app.get("/search", (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send("<h2>400 - Missing search query</h2>");
  res.send(`<h2>Search results for: ${query}</h2>`);
});

app.get("/item/:id", (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).send("<h2>400 - Missing item ID</h2>");
  res.send(`<h2>Item page for ID: ${id}</h2>`);
});

// Routes
app.use("/api/movies", moviesRoutes);
app.use("/api/users", usersRoutes);


app.use("/api", (req, res) => res.status(404).json({ error: "API route not found" }));
app.use((req, res) => res.status(404).send('<h2>404 - Page Not Found</h2><a href="/">Go Home</a>'));


async function startServer() {
  await connectDB(); 
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

startServer();
