let currentPage = 1;
let totalPages = 1;

const reviewsList = document.getElementById("reviewsList");
const pageInfo = document.getElementById("pageInfo");

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadReviews(page = 1) {
  try {
    currentPage = page;

    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", "6");

    const search = document.getElementById("fSearch").value.trim();
    const type = document.getElementById("fType").value;
    const minRating = document.getElementById("fMinRating").value;
    const sortBy = document.getElementById("fSortBy").value;
    const order = document.getElementById("fOrder").value;

    if (search) params.set("search", search);
    if (type) params.set("targetType", type);
    if (minRating) params.set("minRating", minRating);
    if (sortBy) params.set("sortBy", sortBy);
    if (order) params.set("order", order);

    const res = await fetch(`/api/reviews?${params.toString()}`, {
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      reviewsList.innerHTML = `<div class="review-empty">${escapeHtml(data.error || "Failed to load reviews")}</div>`;
      pageInfo.textContent = "Page 1 / 1";
      return;
    }

    totalPages = Math.max(data.totalPages || 1, 1);
    pageInfo.textContent = `Page ${data.page} / ${totalPages}`;

    if (!data.data || data.data.length === 0) {
      reviewsList.innerHTML = `<div class="review-empty">No reviews found</div>`;
      return;
    }

    reviewsList.innerHTML = data.data.map((r) => `
      <article class="review-card">
        <div class="review-head">
          <div class="review-title">${escapeHtml(r.targetTitle || "Untitled")} (${escapeHtml(r.targetType || "unknown")})</div>
          <div class="review-meta">${new Date(r.createdAt).toLocaleString()}</div>
        </div>

        <div class="review-meta">
          <b>${escapeHtml(r.username || "user")}</b> • Rating: ${Number(r.rating)}/10
        </div>

        <p class="review-text">${escapeHtml(r.text || "")}</p>

        <div class="review-actions">
          <button class="review-btn secondary" onclick="editReview('${r._id}')">Edit</button>
          <button class="review-btn secondary" onclick="deleteReview('${r._id}')">Delete</button>
        </div>
      </article>
    `).join("");
  } catch (err) {
    console.error("loadReviews error:", err);
    reviewsList.innerHTML = `<div class="review-empty">Network/server error</div>`;
    pageInfo.textContent = "Page 1 / 1";
  }
}

async function createReview(e) {
  e.preventDefault();

  try {
    const targetType = document.getElementById("targetType").value;
    const targetId = document.getElementById("targetId").value.trim();
    const rating = Number(document.getElementById("rating").value);
    const text = document.getElementById("text").value.trim();

    if (!targetId) return alert("Target ObjectId is required");
    if (Number.isNaN(rating) || rating < 1 || rating > 10) {
      return alert("Rating must be from 1 to 10");
    }

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetType, targetId, rating, text })
    });

    const data = await res.json();

    if (!res.ok) {
      return alert(data.error || "Failed to create review");
    }

    alert("Review created");
    document.getElementById("reviewForm").reset();
    loadReviews(1);
  } catch (err) {
    console.error("createReview error:", err);
    alert("Network/server error");
  }
}

window.editReview = async function editReview(id) {
  try {
    const newRating = prompt("New rating (1-10):");
    if (newRating === null) return;

    const newText = prompt("New text:");
    if (newText === null) return;

    const payload = {};
    if (newRating !== "") payload.rating = Number(newRating);
    payload.text = newText;

    if (payload.rating !== undefined && (Number.isNaN(payload.rating) || payload.rating < 1 || payload.rating > 10)) {
      return alert("Rating must be from 1 to 10");
    }

    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Update failed");

    alert("Review updated");
    loadReviews(currentPage);
  } catch (err) {
    console.error("editReview error:", err);
    alert("Network/server error");
  }
};

window.deleteReview = async function deleteReview(id) {
  try {
    const ok = confirm("Delete this review?");
    if (!ok) return;

    const res = await fetch(`/api/reviews/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Delete failed");

    alert("Review deleted");

    if (currentPage > 1 && reviewsList.children.length === 1) {
      loadReviews(currentPage - 1);
    } else {
      loadReviews(currentPage);
    }
  } catch (err) {
    console.error("deleteReview error:", err);
    alert("Network/server error");
  }
};

// Events
document.getElementById("reviewForm").addEventListener("submit", createReview);

document.getElementById("applyFilters").addEventListener("click", () => {
  loadReviews(1);
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) loadReviews(currentPage - 1);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentPage < totalPages) loadReviews(currentPage + 1);
});

document.addEventListener("DOMContentLoaded", () => {
  loadReviews(1);
});
