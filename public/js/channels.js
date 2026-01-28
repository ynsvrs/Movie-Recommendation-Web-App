const searchInput = document.getElementById("search");
const latestContainer = document.getElementById("latest-channels");
const popularContainer = document.getElementById("popular-channels");
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

// Display channels in a container
function displayChannels(channels, container) {
  container.innerHTML = "";

  if (!channels.length) {
    container.innerHTML = "<p>No Channels found.</p>";
    return;
  }

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

// Load default channels: latest & popular
async function loadDefaultChannels() {
  try {
    const latest = await fetch("/api/channels?sortBy=name&order=asc").then(r => r.json());
    const popular = await fetch("/api/channels?sortBy=name&order=asc").then(r => r.json());

    displayChannels(latest.slice(0, 5), latestContainer);
    displayChannels(popular.slice(0, 5), popularContainer);
  } catch (err) {
    console.error("Failed to load channels:", err);
  }
}

// Search channels
async function searchChannels(query) {
  try {
    const url = query ? `/api/channels?name=${encodeURIComponent(query)}` : "/api/channels";
    const channels = await fetch(url).then(r => r.json());

    displayChannels(channels, latestContainer);

    const headers = document.querySelectorAll('h2');
    if (query) {
      if (popularContainer) popularContainer.style.display = "none";
      headers.forEach(h => {
        if (h.textContent.includes("Popular")) h.style.display = "none";
        if (h.textContent.includes("Latest")) h.textContent = "Search Results";
      });
    } else {
      if (popularContainer) popularContainer.style.display = "grid";
      headers.forEach(h => {
        if (h.textContent.includes("Popular")) h.style.display = "block";
        if (h.textContent.includes("Results")) h.textContent = "Latest Channels";
      });
      loadDefaultChannels();
    }
  } catch (err) {
    console.error("Search failed:", err);
  }
}

// Open modal
function openModal(ch) {
  currentChannel = ch;
  modalLogo.src = ch.logo || "/images/default_channel.jpg";
  modalName.textContent = ch.name;
  modalCountry.textContent = "Country: " + (ch.country || "N/A");
  modalCategory.textContent = "Category: " + (ch.category || "N/A");
  modalDescription.textContent = ch.description || "";
  favoriteBtn.textContent = ch.favorite ? "Remove from Favorites" : "Add to Favorites";
  watchedBtn.textContent = ch.watched ? "Watched ✅" : "Mark as Watched";
  modal.classList.remove("hidden");
}

// Close modal
closeModal.onclick = () => modal.classList.add("hidden");

// Toggle favorite
favoriteBtn.onclick = async () => {
  if (!currentChannel) return;
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
  if (!currentChannel) return;
  await fetch(`/api/channels/${currentChannel._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watched: !currentChannel.watched })
  });
  loadDefaultChannels();
  modal.classList.add("hidden");
};

// Search input event
searchInput.addEventListener("input", () => searchChannels(searchInput.value));

// Initial load
loadDefaultChannels();
