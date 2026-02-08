let isLoggedIn = false;
let userRole = null;
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalGenre = document.getElementById("modalGenre");
const modalYear = document.getElementById("modalYear");
const modalRating = document.getElementById("modalRating");
const modalDescription = document.getElementById("modalDescription");
const favoriteBtn = document.getElementById("favoriteBtn");
const watchedBtn = document.getElementById("watchedBtn");
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");
const createForm = document.getElementById("createMovieForm");
let currentMovie = null;

// Check auth
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json();
    if (data.username) {
      isLoggedIn = true;
      userRole = data.role;
    } else {
      isLoggedIn = false;
      userRole = null;
    }
  } catch (err) {
    console.error("Auth check error:", err);
  }
}

// Display movies
function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (!movies.length) {
    container.innerHTML = "<p>No movies found.</p>";
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${movie.poster || '/images/default_movie.jpg'}" alt="${movie.title || 'Movie'}" />
      <h3>${movie.title || 'Untitled'}</h3>
    `;
    card.onclick = () => openModal(movie);
    container.appendChild(card);
  });
}

// Load default movies
async function loadDefaultMovies() {
  try {
    const all = await fetch("/api/movies").then(r => r.json());
    const latest = [...all].sort((a, b) => (b.year || 0) - (a.year || 0));
    const popular = [...all].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    displayMovies(latest.slice(0, 6), "latest-movies");
    displayMovies(popular.slice(0, 6), "popular-movies");
  } catch (err) {
    console.error("Failed to load movies:", err);
  }
}

// Search movies
async function searchMovies(query) {
  try {
    const url = query ? `/api/movies?title=${encodeURIComponent(query)}` : "/api/movies";
    const movies = await fetch(url).then(r => r.json());
    displayMovies(movies, "latest-movies");
    const popularSection = document.getElementById("popular-movies");
    if (query) {
      popularSection.style.display = "none";
    } else {
      popularSection.style.display = "grid";
      loadDefaultMovies();
    }
  } catch (err) {
    console.error("Search failed:", err);
  }
}

// Open modal
function openModal(movie) {
  currentMovie = movie;

  // Debug: check what data we have
  console.log("Opening modal for movie:", movie);

  modalPoster.src = movie.poster || "/images/default_movie.jpg";
  modalPoster.onerror = () => { modalPoster.src = "/images/default_movie.jpg"; };

  modalTitle.textContent = movie.title || "Untitled";
  modalGenre.textContent = "Genre: " + (movie.genre || "N/A");
  modalYear.textContent = "Year: " + (movie.year || "N/A");
  modalRating.textContent = "Rating: " + (movie.rating || "N/A");
  modalDescription.textContent = movie.description || "No description available.";

  // Favorite button
  favoriteBtn.textContent = movie.isFavorite ? "Added (remove in Profile)" : "Add to Favorites";
  favoriteBtn.disabled = movie.isFavorite;
  favoriteBtn.style.display = isLoggedIn ? "inline-block" : "none";

  // Watched button
  watchedBtn.textContent = movie.isWatched ? "Watched ✅" : "Mark as Watched";
  watchedBtn.style.display = isLoggedIn ? "inline-block" : "none";

  // Admin buttons
  updateBtn.style.display = (userRole === 'admin') ? "inline-block" : "none";
  deleteBtn.style.display = (userRole === 'admin') ? "inline-block" : "none";

  modal.classList.remove("hidden");
}

closeModal.onclick = () => modal.classList.add("hidden");

// Toggle favorite (only add - no remove here)
favoriteBtn.onclick = async () => {
  if (!currentMovie || !isLoggedIn) {
    alert("Please login first");
    return;
  }

  if (currentMovie.isFavorite) {
    alert("Already in favorites. Remove from your Profile page.");
    return;
  }

  try {
    const res = await fetch(`/api/profile/favorites/movies/${currentMovie._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (res.ok) {
      currentMovie.isFavorite = true;
      favoriteBtn.textContent = "Added (remove in Profile)";
      favoriteBtn.disabled = true;
      alert("Added to favorites!");
      loadDefaultMovies();
    } else {
      alert("Failed to add");
    }
  } catch (err) {
    console.error("Favorite error:", err);
    alert("Network error");
  }
};

// Toggle watched
watchedBtn.onclick = async () => {
  if (!currentMovie || !isLoggedIn) {
    alert("Please login first");
    return;
  }

  const isCurrentlyWatched = currentMovie.isWatched;
  const method = isCurrentlyWatched ? "DELETE" : "POST";
  const url = `/api/profile/watched/movies/${currentMovie._id}`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (res.ok) {
      currentMovie.isWatched = !isCurrentlyWatched;
      watchedBtn.textContent = currentMovie.isWatched ? "Watched ✅" : "Mark as Watched";
      alert(currentMovie.isWatched ? "Marked as watched!" : "Removed from watched");
      loadDefaultMovies();
    } else {
      alert("Failed to update watched status");
    }
  } catch (err) {
    console.error("Watched error:", err);
    alert("Network error");
  }
};

// Admin: Update movie
updateBtn.onclick = async () => {
  if (!currentMovie || userRole !== 'admin') return;

  const updated = {
    title: prompt("Title:", currentMovie.title) || currentMovie.title,
    genre: prompt("Genre:", currentMovie.genre) || currentMovie.genre,
    year: Number(prompt("Year:", currentMovie.year)) || currentMovie.year,
    rating: Number(prompt("Rating:", currentMovie.rating)) || currentMovie.rating,
    poster: prompt("Poster URL:", currentMovie.poster) || currentMovie.poster,
    description: prompt("Description:", currentMovie.description) || currentMovie.description
  };

  try {
    const res = await fetch(`/api/movies/${currentMovie._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updated)
    });

    if (res.ok) {
      loadDefaultMovies();
      modal.classList.add("hidden");
      alert("Movie updated!");
    } else {
      alert("Failed to update");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};

// Admin: Delete movie
deleteBtn.onclick = async () => {
  if (!currentMovie || userRole !== 'admin') return;
  if (!confirm("Delete this movie?")) return;

  try {
    const res = await fetch(`/api/movies/${currentMovie._id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (res.ok) {
      loadDefaultMovies();
      modal.classList.add("hidden");
      alert("Movie deleted");
    } else {
      alert("Failed to delete");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};

// Create movie (admin only)
createForm.onsubmit = async (e) => {
  e.preventDefault();
  if (userRole !== 'admin') return;

  const newMovie = {
    title: document.getElementById("newTitle").value.trim(),
    genre: document.getElementById("newGenre").value.trim(),
    year: Number(document.getElementById("newYear").value) || null,
    rating: Number(document.getElementById("newRating").value) || 0,
    poster: document.getElementById("newPoster").value.trim() || "/images/default_movie.jpg",
    description: document.getElementById("newDescription").value.trim()
  };

  try {
    const res = await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newMovie)
    });

    if (res.ok) {
      createForm.reset();
      loadDefaultMovies();
      alert("Movie created!");
    } else {
      alert("Failed to create movie");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};

// Initial load
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();

  // Hide create form for non-admins
 const adminCreateSection = document.getElementById("admin-create-section");

if (adminCreateSection) {
  adminCreateSection.style.display = userRole === 'admin' ? "block" : "none";
}
  loadDefaultMovies();
});

searchInput.addEventListener("input", () => searchMovies(searchInput.value));