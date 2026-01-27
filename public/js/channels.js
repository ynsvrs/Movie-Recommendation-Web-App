const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalLogo = document.getElementById("modalLogo");
const modalName = document.getElementById("modalName");
const modalCountry = document.getElementById("modalCountry");
const modalCategory = document.getElementById("modalCategory");
const modalDescription = document.getElementById("modalDescription");
const favoriteBtn = document.getElementById("favoriteBtn");
const watchedBtn = document.getElementById("watchedBtn");

let currentChannel = null;

// Display channels in a given container
function displayChannels(channels, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  channels.forEach(ch => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${ch.logo}" alt="${ch.name}" />
      <h3>${ch.name}</h3>
      <p>${ch.country} | ${ch.category}</p>
    `;
    card.addEventListener("click", () => openModal(ch));
    container.appendChild(card);
  });
}

// Load default sections: Latest and Popular
async function loadDefaultChannels() {
  const latest = await fetch("/api/channels?sortBy=name&order=asc").then(r => r.json());
  const popular = await fetch("/api/channels?sortBy=name&order=asc").then(r => r.json());
  displayChannels(latest.slice(0, 5), "latest-channels");
  displayChannels(popular.slice(0, 5), "popular-channels");
}

// Search channels by name
async function searchChannels(query) {
  const url = query ? `/api/channels?name=${query}` : "/api/channels";
  const channels = await fetch(url).then(r => r.json());
  displayChannels(channels, "latest-channels"); // show search results in main section
}

// Open modal with channel details
function openModal(ch) {
  currentChannel = ch;
  modalLogo.src = ch.logo;
  modalName.textContent = ch.name;
  modalCountry.textContent = "Country: " + ch.country;
  modalCategory.textContent = "Category: " + ch.category;
  modalDescription.textContent = ch.description;
  favoriteBtn.textContent = ch.favorite ? "Remove from Favorites" : "Add to Favorites";
  watchedBtn.textContent = ch.watched ? "Watched ✅" : "Mark as Watched";
  modal.classList.remove("hidden");
}

// Close modal
closeModal.onclick = () => modal.classList.add("hidden");

// Toggle favorite
favoriteBtn.onclick = async () => {
  await fetch(`/api/channels/${currentChannel._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ favorite: !currentChannel.favorite })
  });
  loadDefaultChannels();
  modal.classList.add("hidden");
};

// Toggle watched
watchedBtn.onclick = async () => {
  await fetch(`/api/channels/${currentChannel._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watched: !currentChannel.watched })
  });
  loadDefaultChannels();
  modal.classList.add("hidden");
};

// Search input listener
searchInput.addEventListener("input", () => searchChannels(searchInput.value));

// Initial load
loadDefaultChannels();
