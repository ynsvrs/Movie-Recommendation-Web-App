const form = document.getElementById("loginForm");
const msg = document.getElementById("loginMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value;

  if (!login || !password) {
    msg.textContent = "Fill both fields";
    msg.style.color = "red";
    return;
  }

  msg.textContent = "Logging in...";
  msg.style.color = "#aaa";

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ login, password })
    });

    const data = await res.json();

    if (res.ok) {
      msg.textContent = "Success! Redirecting...";
      msg.style.color = "green";
      // Force navbar refresh + redirect
      await updateNavbar();
      setTimeout(() => window.location.href = "/", 1200);
    } else {
      msg.textContent = data.error || "Login failed";
      msg.style.color = "red";
    }
  } catch (err) {
    msg.textContent = "Connection error";
    msg.style.color = "red";
    console.error(err);
  }
});