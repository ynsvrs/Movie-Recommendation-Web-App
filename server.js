const express = require('express');
const fs = require('fs');
const path = require('path');

const movieModel = require('./movieModel');

const app = express();
const PORT = 3000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // required for API

// Custom logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// pages routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// About page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

// Contact POST
app.post('/contact', (req, res) => {
  const filePath = path.join(__dirname, 'submissions.json');
  let submissions = [];

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
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

// Search page (placeholder from Part 1)
app.get('/search', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).send('<h2>400 - Missing search query</h2>');
  }
  res.send(`<h2>Search results for: ${query}</h2>`);
});

// Item page (placeholder from Part 1)
app.get('/item/:id', (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).send('<h2>400 - Missing item ID</h2>');
  }
  res.send(`<h2>Item page for ID: ${id}</h2>`);
});

// api routes(crud operations for movies)

// GET all movies
app.get('/api/movies', (req, res) => {
  movieModel.getAllMovies((err, movies) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(200).json(movies);
  });
});

// GET movie by ID
app.get('/api/movies/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  movieModel.getMovieById(id, (err, movie) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    res.status(200).json(movie);
  });
});

// POST create movie
app.post('/api/movies', (req, res) => {
  const { title, genre, rating } = req.body;

  if (!title || !genre) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  movieModel.addMovie({ title, genre, rating }, (err, id) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    res.status(201).json({
      id,
      title,
      genre,
      rating
    });
  });
});

// PUT update movie
app.put('/api/movies/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, genre, rating } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  if (!title || !genre) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  movieModel.updateMovie(id, { title, genre, rating }, (err, changes) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (changes === 0) return res.status(404).json({ error: 'Movie not found' });

    res.status(200).json({ message: 'Movie updated' });
  });
});

// DELETE movie
app.delete('/api/movies/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  movieModel.deleteMovie(id, (err, changes) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (changes === 0) return res.status(404).json({ error: 'Movie not found' });

    res.status(200).json({ message: 'Movie deleted' });
  });
});

// 404 handling

// API 404
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Page 404
app.use((req, res) => {
  res.status(404).send('<h2>404 - Page Not Found</h2><a href="/">Go Home</a>');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
