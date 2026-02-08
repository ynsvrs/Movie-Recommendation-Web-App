let currentUser = null;

async function loadUserData() {
  try {
    // Step 1: Checks if user is authenticated
    const authRes = await fetch("/api/auth/me", { credentials: "include" });
    const authData = await authRes.json();

    if (!authData.username) {
      console.log("Not authenticated → redirecting to login");
      window.location.href = "/login.html";
      return;
    }

    currentUser = authData;

    // Step 2: Loads full profile info
    const profileRes = await fetch("/api/profile", { credentials: "include" });
    if (!profileRes.ok) throw new Error("Failed to load profile");
    const user = await profileRes.json();

    // Fills user info
    document.getElementById("username").textContent = user.username || "N/A";
    document.getElementById("email").textContent = user.email || "N/A";
    document.getElementById("memberSince").textContent = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A";

    const badge = document.getElementById("roleBadge");
    badge.textContent = (user.role || "user").toUpperCase();
    badge.className = `badge badge-${user.role || "user"}`;

    // Step 3: Loads favorites & watched lists
    await loadLists();
  } catch (err) {
    console.error("Profile load failed:", err);
    alert("Failed to load profile. Redirecting to login...");
    window.location.href = "/login.html";
  }
}

async function loadLists() {
  try {
    const res = await fetch("/api/profile/lists", { credentials: "include" });
    if (!res.ok) {
      console.error("Lists fetch failed:", res.status);
      throw new Error("Failed to load lists");
    }
    const data = await res.json();

    console.log("Loaded lists data:", data); 

    displayItems(data.favorites?.movies || [], "moviesGrid", "movies", "favorites");
    displayItems(data.favorites?.tvshows || [], "tvshowsGrid", "tvshows", "favorites");
    displayItems(data.favorites?.channels || [], "channelsGrid", "channels", "favorites");

    displayItems(data.watched?.movies || [], "moviesWatchedGrid", "movies", "watched");
    displayItems(data.watched?.tvshows || [], "tvshowsWatchedGrid", "tvshows", "watched");
    displayItems(data.watched?.channels || [], "channelsWatchedGrid", "channels", "watched");
  } catch (err) {
    console.error("Failed to load favorites/watched:", err);
    document.querySelector(".container")?.insertAdjacentHTML(
      "afterbegin",
      '<p style="color:red; text-align:center;">Failed to load your lists</p>'
    );
  }
}

function displayItems(items, containerId, type, listType = "favorites") {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="empty-state">No items yet</p>';
    return;
  }

  container.innerHTML = items.map(item => {
    const imageUrl = item.poster || item.logo || "/images/default_movie.jpg";
    const title = item.title || item.name || "Untitled";
    const subtitle = type === "movies"
      ? `${item.genre || "N/A"} • ${item.year || "N/A"}`
      : type === "tvshows"
      ? `${item.genre || "N/A"} • ${item.seasons || 0} seasons`
      : `${item.category || "N/A"} • ${item.country || "N/A"}`;

    return `
      <div class="fav-card">
        <img src="${imageUrl}" alt="${title}" onerror="this.src='/images/default_movie.jpg'">
        <div class="fav-card-content">
          <h3>${title}</h3>
          <p>${subtitle}</p>
          ${listType === "favorites" ? `
            <button class="remove-btn" onclick="removeFavorite('${listType}', '${type}', '${item._id}')">
              Remove from Favorites
            </button>
          ` : ""}
        </div>
      </div>
    `;
  }).join("");
}

async function removeFavorite(listType, type, id) {
  if (!confirm(`Remove this ${type} from your ${listType}?`)) return;

  try {
    const res = await fetch(`/api/profile/${listType}/${type}/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (res.ok) {
      loadLists(); 
      alert("Removed successfully!");
    } else {
      const errData = await res.json();
      alert(errData.error || "Failed to remove");
    }
  } catch (err) {
    console.error("Remove failed:", err);
    alert("Network error - please try again");
  }
}

async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserData();
});