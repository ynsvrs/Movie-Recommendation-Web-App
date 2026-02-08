let isLoggedIn = false;
let userRole = null;
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
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");
const createForm = document.getElementById("createChannelForm");
const adminCreateSection = document.getElementById("admin-create-section");

let currentChannel = null;

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
  favoriteBtn.textContent = ch.isFavorite ? "Remove from Favorites" : "Add to Favorites";
  watchedBtn.textContent = ch.isWatched ? "Watched ✅" : "Mark as Watched";
  favoriteBtn.style.display = isLoggedIn ? "inline-block" : "none";
  favoriteBtn.textContent = currentChannel.isFavorite ? "Added (remove in Profile)" : "Add to Favorites";
  favoriteBtn.disabled = currentChannel.isFavorite;
  watchedBtn.style.display = isLoggedIn ? "inline-block" : "none";
  updateBtn.style.display = (userRole === 'admin') ? "inline-block" : "none";
  deleteBtn.style.display = (userRole === 'admin') ? "inline-block" : "none";
  modal.classList.remove("hidden");
}

// Close modal
closeModal.onclick = () => modal.classList.add("hidden");

// Toggle favorite
favoriteBtn.onclick = async () => {
  if (!currentChannel || !isLoggedIn) {
    alert("Please login first");
    return;
  }

  if (currentChannel.isFavorite) {
    alert("Already in favorites. Remove it from your Profile page.");
    return;
  }

  try {
    const res = await fetch(`/api/profile/favorites/channels/${currentChannel._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (res.ok) {
      currentChannel.isFavorite = true;
      favoriteBtn.textContent = "Added (remove in Profile)";
      favoriteBtn.disabled = true;
      alert("Added to favorites! You can remove it from Profile.");
      loadDefaultChannels();
    } else {
      alert("Failed to add to favorites");
    }
  } catch (err) {
    console.error("Favorite add error:", err);
    alert("Network error");
  }
};

// Toggle watched
watchedBtn.onclick = async () => {
  if (!currentChannel || !isLoggedIn) {
    alert("Please login first");
    return;
  }

  const isCurrentlyWatched = currentChannel.isWatched;
  const method = isCurrentlyWatched ? "DELETE" : "POST";
  const url = `/api/profile/watched/channels/${currentChannel._id}`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (res.ok) {
      currentChannel.isWatched = !isCurrentlyWatched;
      watchedBtn.textContent = currentChannel.isWatched ? "Watched ✅" : "Mark as Watched";
      alert(currentChannel.isWatched ? "Marked as watched!" : "Removed from watched");
      loadDefaultChannels(); // refresh the list
    } else {
      const error = await res.json();
      alert(error.error || "Failed to update watched status");
    }
  } catch (err) {
    console.error("Watched error:", err);
    alert("Network error - please try again");
  }
};

// Update channel
updateBtn.onclick = async () => {
  if (!currentChannel || userRole !== 'admin') return;
  const updated = {
    name: prompt("Name:", currentChannel.name) || currentChannel.name,
    country: prompt("Country:", currentChannel.country) || currentChannel.country,
    category: prompt("Category:", currentChannel.category) || currentChannel.category,
    logo: prompt("Logo URL:", currentChannel.logo) || currentChannel.logo,
    description: prompt("Description:", currentChannel.description) || currentChannel.description
  };
  await fetch(`/api/channels/${currentChannel._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated)
  });
  loadDefaultChannels();
  modal.classList.add("hidden");
};

// Delete channel
deleteBtn.onclick = async () => {
  if (!currentChannel || userRole !== 'admin') return;
  if (!confirm("Are you sure?")) return;
  await fetch(`/api/channels/${currentChannel._id}`, { method: "DELETE" });
  loadDefaultChannels();
  modal.classList.add("hidden");
};

// Create channel
createForm.onsubmit = async (e) => {
  e.preventDefault();
  if (userRole !== 'admin') return;
  const newChannel = {
    name: document.getElementById("newName").value,
    country: document.getElementById("newCountry").value,
    category: document.getElementById("newCategory").value,
    logo: document.getElementById("newLogo").value,
    description: document.getElementById("newDescription").value
  };
  await fetch("/api/channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newChannel)
  });
  createForm.reset();
  loadDefaultChannels();
};

// Search input event
searchInput.addEventListener("input", () => searchChannels(searchInput.value));

// Initial load
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
   if (userRole !== 'admin' && adminCreateSection) {
    adminCreateSection.style.display = "none";
  }
  loadDefaultChannels();
});