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
const createForm = document.getElementById("createTvShowForm");
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const watchedBtn = document.getElementById("watchedBtn");
let currentShow = null;

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
  const url = query ? `/api/tvshows?title=${query}` : "/api/tvshows";
  const shows = await fetch(url).then(r => r.json());
  displayShows(shows, "latest-tvshows"); // show search results in main section
}

// CREATE TV Show
createForm.onsubmit = async (e) => {
  e.preventDefault();
  const newShow = {
    title: document.getElementById("newTitle").value,
    genre: document.getElementById("newGenre").value,
    seasons: Number(document.getElementById("newSeasons").value) || 1,
    year: Number(document.getElementById("newYear").value) || "",
    rating: Number(document.getElementById("newRating").value) || "",
    poster: document.getElementById("newPoster").value || "/images/default_tvshow.jpg",
    description: document.getElementById("newDescription").value || "",
  };
  
  const res = await fetch("/api/tvshows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newShow)
  });
  
  if (res.ok) {
    alert("TV Show created!");
    createForm.reset();
    loadDefaultShows();
  } else {
    alert("Failed to create TV Show");
  }
};

// UPDATE TV Show
updateBtn.onclick = async () => {
  if (!currentShow) return;
  const updatedShow = {
    title: prompt("Title:", currentShow.title) || currentShow.title,
    genre: prompt("Genre:", currentShow.genre) || currentShow.genre,
    seasons: Number(prompt("Seasons:", currentShow.seasons)) || currentShow.seasons,
    year: Number(prompt("Year:", currentShow.year)) || currentShow.year,
    rating: Number(prompt("Rating:", currentShow.rating)) || currentShow.rating,
    poster: prompt("Poster URL:", currentShow.poster) || currentShow.poster,
    description: prompt("Description:", currentShow.description) || currentShow.description,
  };

  const res = await fetch(`/api/tvshows/${currentShow._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedShow)
  });

  if (res.ok) {
    alert("TV Show updated!");
    modal.classList.add("hidden");
    loadDefaultShows();
  } else {
    alert("Failed to update TV Show");
  }
};

// DELETE TV Show
deleteBtn.onclick = async () => {
  if (!currentShow) return;
  if (!confirm("Are you sure you want to delete this TV Show?")) return;

  const res = await fetch(`/api/tvshows/${currentShow._id}`, { method: "DELETE" });
  if (res.ok) {
    alert("TV Show deleted!");
    modal.classList.add("hidden");
    loadDefaultShows();
  } else {
    alert("Failed to delete TV Show");
  }
};

function openModal(show) {
  currentShow = show;
  modalPoster.src = show.poster;
  modalTitle.textContent = show.title;
  modalGenre.textContent = "Genre: " + show.genre;
  modalSeasons.textContent = "Seasons: " + show.seasons;
  modalYear.textContent = "Year: " + show.year;
  modalRating.textContent = "Rating: " + show.rating;
  modalDescription.textContent = show.description;
  favoriteBtn.textContent = show.favorite ? "Remove from Favorites" : "Add to Favorites";
  watchedBtn.textContent = show.watched ? "Watched ✅" : "Mark as Watched";
  modal.classList.remove("hidden");
}

closeModal.onclick = () => modal.classList.add("hidden");

favoriteBtn.onclick = async () => {
  await fetch(`/api/tvshows/${currentShow._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ favorite: !currentShow.favorite })
  });
  loadDefaultShows();
  modal.classList.add("hidden");
};

watchedBtn.onclick = async () => {
  await fetch(`/api/tvshows/${currentShow._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watched: !currentShow.watched })
  });
  loadDefaultShows();
  modal.classList.add("hidden");
};

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


searchInput.addEventListener("input", () => searchShows(searchInput.value));

// Initial load
loadDefaultShows();
