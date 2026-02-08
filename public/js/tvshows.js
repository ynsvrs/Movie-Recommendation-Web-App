// public/js/tvshows.js
let isLoggedIn = false;
let userRole = null;
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalGenre = document.getElementById("modalGenre");
const modalSeasons = document.getElementById("modalSeasons");
const modalYear = document.getElementById("modalYear");
const modalRating = document.getElementById("modalRating");
const modalDescription = document.getElementById("modalDescription");
const favoriteBtn = document.getElementById("favoriteBtn");
const watchedBtn = document.getElementById("watchedBtn");
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");
const createForm = document.getElementById("createTvShowForm");
const adminCreateSection = document.getElementById("admin-create-section");

let currentShow = null;

// Check auth
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.username) {
      isLoggedIn = true;
      userRole = data.role;
    } else {
      isLoggedIn = false;
      userRole = null;
    }
  } catch (err) {
    console.error(err);
  }
}

function displayShows(shows, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  shows.forEach(show => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${show.poster}" alt="${show.title}" />
      <h3>${show.title}</h3>
    `;
    card.addEventListener("click", () => openModal(show));
    container.appendChild(card);
  });
}

async function loadDefaultShows() {
  const latest = await fetch("/api/tvshows?sortBy=year&order=desc").then(r => r.json());
  const popular = await fetch("/api/tvshows?sortBy=rating&order=desc").then(r => r.json());
  displayShows(latest.slice(0, 5), "latest-tvshows");
  displayShows(popular.slice(0, 5), "popular-tvshows");
}

async function searchShows(query) {
  const url = query ? `/api/tvshows?title=${encodeURIComponent(query)}` : "/api/tvshows";
  try {
    const shows = await fetch(url).then(r => r.json());
    displayShows(shows, "latest-tvshows");
    const popularSection = document.getElementById("popular-tvshows");
    const headers = document.querySelectorAll('h2');
    if (query) {
      if (popularSection) popularSection.style.display = "none";
      headers.forEach(h => {
        if (h.textContent.includes("Popular")) h.style.display = "none";
        if (h.textContent.includes("Latest")) h.textContent = "Search Results";
      });
    } else {
      if (popularSection) popularSection.style.display = "grid";
      headers.forEach(h => {
        if (h.textContent.includes("Popular")) h.style.display = "block";
        if (h.textContent.includes("Results")) h.textContent = "Latest TV Shows";
      });
      loadDefaultShows();
    }
  } catch (err) {
    console.error("Search failed:", err);
  }
}

function openModal(show) {
  currentShow = show;
  modalPoster.src = show.poster;
  modalTitle.textContent = show.title;
  modalGenre.textContent = "Genre: " + show.genre;
  modalSeasons.textContent = "Seasons: " + show.seasons;
  modalYear.textContent = "Year: " + show.year;
  modalRating.textContent = "Rating: " + show.rating;
  modalDescription.textContent = show.description;
  favoriteBtn.textContent = show.isFavorite ? "Remove from Favorites" : "Add to Favorites";
  favoriteBtn.textContent = currentShow.isFavorite ? "Added (remove in Profile)" : "Add to Favorites";
  favoriteBtn.disabled = currentShow.isFavorite;
  watchedBtn.textContent = show.isWatched ? "Watched ✅" : "Mark as Watched";
  favoriteBtn.style.display = isLoggedIn ? "inline-block" : "none";
  watchedBtn.style.display = isLoggedIn ? "inline-block" : "none";
  updateBtn.style.display = (userRole === 'admin') ? "inline-block" : "none";
  deleteBtn.style.display = (userRole === 'admin') ? "inline-block" : "none";
  modal.classList.remove("hidden");
}

closeModal.onclick = () => modal.classList.add("hidden");


favoriteBtn.onclick = async () => {
  if (!currentShow || !isLoggedIn) {
    alert("Please login first");
    return;
  }

  if (currentShow.isFavorite) {
    alert("Already in favorites. Remove it from your Profile page.");
    return;
  }

  try {
    const res = await fetch(`/api/profile/favorites/tvshows/${currentShow._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (res.ok) {
      currentShow.isFavorite = true;
      favoriteBtn.textContent = "Added (remove in Profile)";
      favoriteBtn.disabled = true;
      alert("Added to favorites! You can remove it from Profile.");
      loadDefaultShows();
    } else {
      alert("Failed to add to favorites");
    }
  } catch (err) {
    console.error("Favorite add error:", err);
    alert("Network error");
  }
};

watchedBtn.onclick = async () => {
  if (!currentShow || !isLoggedIn) {
    alert("Please login first");
    return;
  }

  const isCurrentlyWatched = currentShow.isWatched;
  const method = isCurrentlyWatched ? "DELETE" : "POST";
  const url = `/api/profile/watched/tvshows/${currentShow._id}`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (res.ok) {
      currentShow.isWatched = !isCurrentlyWatched;
      watchedBtn.textContent = currentShow.isWatched ? "Watched ✅" : "Mark as Watched";
      alert(currentShow.isWatched ? "Marked as watched!" : "Removed from watched");
      loadDefaultShows(); 
    } else {
      const error = await res.json();
      alert(error.error || "Failed to update watched status");
    }
  } catch (err) {
    console.error("Watched error:", err);
    alert("Network error - please try again");
  }
};

// UPDATE TV Show
updateBtn.onclick = async () => {
  if (!currentShow || userRole !== 'admin') return;
  const updatedShow = {
    title: prompt("Title:", currentShow.title) || currentShow.title,
    genre: prompt("Genre:", currentShow.genre) || currentShow.genre,
    seasons: Number(prompt("Seasons:", currentShow.seasons)) || currentShow.seasons,
    year: Number(prompt("Year:", currentShow.year)) || currentShow.year,
    rating: Number(prompt("Rating:", currentShow.rating)) || currentShow.rating,
    poster: prompt("Poster URL:", currentShow.poster) || currentShow.poster,
    description: prompt("Description:", currentShow.description) || currentShow.description,
  };
  await fetch(`/api/tvshows/${currentShow._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedShow)
  });
  loadDefaultShows();
  modal.classList.add("hidden");
};

// DELETE TV Show
deleteBtn.onclick = async () => {
  if (!currentShow || userRole !== 'admin') return;
  if (!confirm("Are you sure you want to delete this TV Show?")) return;
  await fetch(`/api/tvshows/${currentShow._id}`, { method: "DELETE" });
  loadDefaultShows();
  modal.classList.add("hidden");
};

// CREATE TV Show
createForm.onsubmit = async (e) => {
  e.preventDefault();
  if (userRole !== 'admin') return;
  const newShow = {
    title: document.getElementById("newTitle").value,
    genre: document.getElementById("newGenre").value,
    seasons: document.getElementById("newSeasons").value,
    year: document.getElementById("newYear").value,
    rating: document.getElementById("newRating").value,
    poster: document.getElementById("newPoster").value,
    description: document.getElementById("newDescription").value,
  };
  await fetch("/api/tvshows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newShow)
  });
  createForm.reset();
  loadDefaultShows();
};

// Initial load
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
 if (userRole !== 'admin' && adminCreateSection) {
  adminCreateSection.style.display = "none";
}
  loadDefaultShows();
});
searchInput.addEventListener("input", () => searchShows(searchInput.value));