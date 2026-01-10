const db = require('./db');

// Get all movies
function getAllMovies(callback) {
  db.all("SELECT * FROM movies ORDER BY id ASC", callback);
}

// Get a movie by ID
function getMovieById(id, callback) {
  db.get("SELECT * FROM movies WHERE id = ?", [id], callback);
}

// Add a new movie
function addMovie(data, callback) {
  const { title, genre, rating } = data;
  db.run(
    "INSERT INTO movies (title, genre, rating) VALUES (?, ?, ?)",
    [title, genre, rating],
    function(err) {
      callback(err, this.lastID);
    }
  );
}

// Update a movie
function updateMovie(id, data, callback) {
  const { title, genre, rating } = data;
  db.run(
    "UPDATE movies SET title = ?, genre = ?, rating = ? WHERE id = ?",
    [title, genre, rating, id],
    function(err) {
      callback(err, this.changes);
    }
  );
}

// Delete a movie
function deleteMovie(id, callback) {
  db.run(
    "DELETE FROM movies WHERE id = ?",
    [id],
    function(err) {
      callback(err, this.changes);
    }
  );
}

module.exports = {
  getAllMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie
};
