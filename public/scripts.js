// API base URL
const API_URL = '/api';

// Add Movie
async function addMovie() {
  const title = document.getElementById('title').value;
  const genre = document.getElementById('genre').value;
  const year = document.getElementById('year').value;
  const rating = document.getElementById('rating').value;
  
  if (!title || !genre) {
    document.getElementById('status').textContent = '❌ Title and Genre are required';
    document.getElementById('status').style.color = '#dc3545';
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        genre,
        year: year ? Number(year) : null,
        rating: rating ? Number(rating) : null
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('status').textContent = '✅ Movie added successfully!';
      document.getElementById('status').style.color = '#28a745';
      document.getElementById('title').value = '';
      document.getElementById('genre').value = '';
      document.getElementById('year').value = '';
      document.getElementById('rating').value = '';
      
      // Reload movies
      setTimeout(() => {
        loadMovies();
        document.getElementById('status').textContent = '';
      }, 1500);
    } else {
      document.getElementById('status').textContent = '❌ Error: ' + data.error;
      document.getElementById('status').style.color = '#dc3545';
    }
  } catch (error) {
    document.getElementById('status').textContent = '❌ Error: ' + error.message;
    document.getElementById('status').style.color = '#dc3545';
  }
}

// Load Movies
async function loadMovies() {
  const filterGenre = document.getElementById('filterGenre').value;
  const sortBy = document.getElementById('sortBy').value;
  const projection = document.getElementById('projection').value;
  
  let url = `${API_URL}/movies?`;
  if (filterGenre) url += `genre=${filterGenre}&`;
  if (sortBy) url += `sortBy=${sortBy}&order=desc&`;
  if (projection) url += `fields=${projection}`;
  
  try {
    const response = await fetch(url);
    const movies = await response.json();
    
    displayMovies(movies);
  } catch (error) {
    console.error('Error loading movies:', error);
    const tbody = document.querySelector('table tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5" style="color: #dc3545;">Error loading movies</td></tr>';
    }
  }
}

// Display Movies in Table
function displayMovies(movies) {
  const tbody = document.querySelector('table tbody');
  
  if (!tbody) {
    console.error('Table tbody not found');
    return;
  }
  
  tbody.innerHTML = '';
  
  if (movies.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No movies found</td></tr>';
    return;
  }
  
  movies.forEach(movie => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${movie.title || 'N/A'}</td>
      <td>${movie.genre || 'N/A'}</td>
      <td>${movie.year || 'N/A'}</td>
      <td>${movie.rating || 'N/A'}</td>
      <td>
        <button class="btn-delete" onclick="deleteMovie('${movie._id}')">🗑️ Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Delete Movie
async function deleteMovie(id) {
  if (!confirm('Are you sure you want to delete this movie?')) {
    return;
  }
  try {
    const response = await fetch(`${API_URL}/movies/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      loadMovies();
    } else {
      const data = await response.json();
      alert('Error deleting movie: ' + data.error);
    }
  } catch (error) {
    console.error('Error deleting movie:', error);
    alert('Error deleting movie: ' + error.message);
  }
}

// Load movies when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, loading movies...');
  loadMovies();
});