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

let currentMovie = null;



// ---------- render cards ----------
function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${movie.poster || '/images/default_movie.jpg'}" />
      <h3>${movie.title}</h3>
    `;

    card.onclick = () => openModal(movie);

    container.appendChild(card);
  });
}



// ---------- load latest + popular ----------
async function loadDefaultMovies() {
  const all = await fetch("/api/movies").then(r => r.json());

  const latest = [...all].sort((a, b) => b.year - a.year);
  const popular = [...all].sort((a, b) => b.rating - a.rating);

  displayMovies(latest.slice(0, 6), "latest-movies");
  displayMovies(popular.slice(0, 6), "popular-movies");
}



// ---------- search ----------
async function searchMovies(query) {
  let url = "/api/movies";

  if (query)
    url += '?fields=title,genre,rating,year,poster';

  const movies = await fetch(url).then(r => r.json());

  let result = movies;

  if (query)
    result = movies.filter(m =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );

  displayMovies(result, "latest-movies");

  const popularSection = document.getElementById("popular-movies");

  if (query) {
    popularSection.style.display = "none";
  } else {
    popularSection.style.display = "grid";
    loadDefaultMovies();
  }
}



// ---------- modal ----------
function openModal(movie) {
  currentMovie = movie;

  modalPoster.src = movie.poster || "/images/default_movie.jpg";
  modalTitle.textContent = movie.title;
  modalGenre.textContent = "Genre: " + movie.genre;
  modalYear.textContent = "Year: " + movie.year;
  modalRating.textContent = "Rating: " + movie.rating;
  modalDescription.textContent = movie.description || "";

  modal.classList.remove("hidden");
}


closeModal.onclick = () => modal.classList.add("hidden");


// initial load
loadDefaultMovies();