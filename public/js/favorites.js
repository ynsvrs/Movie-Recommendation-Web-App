const favList = document.getElementById("favorites-list");

async function loadFavorites() {
  const res = await fetch("/api/favorites");
  const data = await res.json();

  favList.innerHTML = "";

  // TV Show favorites
  data.tvFavs.forEach(tv => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${tv.poster}" alt="${tv.title}" />
      <h3>${tv.title}</h3>
      <p>${tv.genre}</p>
      <button onclick="removeFavorite('tvshow','${tv._id}')">Remove</button>
    `;
    favList.appendChild(card);
  });

  // Channel favorites
  data.chFavs.forEach(ch => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${ch.logo}" alt="${ch.name}" />
      <h3>${ch.name}</h3>
      <p>${ch.category} | ${ch.country}</p>
      <button onclick="removeFavorite('channel','${ch._id}')">Remove</button>
    `;
    favList.appendChild(card);
  });
}

async function removeFavorite(type, id) {
  const url = type === "tvshow" ? `/api/favorites/tvshow/${id}` : `/api/favorites/channel/${id}`;
  await fetch(url, { method: "DELETE" });
  loadFavorites();
}

// Initial load
loadFavorites();
