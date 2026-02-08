async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.username) {
      document.getElementById("loginBtn").style.display = "none";
      document.getElementById("logoutBtn").style.display = "inline-block";
      document.getElementById("welcomeMsg").textContent = `Hello, ${data.username}`;
    } else {
      document.getElementById("loginBtn").style.display = "inline-block";
      document.getElementById("logoutBtn").style.display = "none";
      document.getElementById("welcomeMsg").textContent = "";
    }
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", checkAuth);

document.getElementById("loginBtn")?.addEventListener("click", () => {
  window.location.href = "/login.html";
});


document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  checkAuth();
});
