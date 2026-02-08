const form = document.getElementById("registerForm");
const errorDiv = document.getElementById("error");
const successDiv = document.getElementById("success");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorDiv.style.display = "none";
  successDiv.style.display = "none";
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      successDiv.textContent = "Registration successful! Redirecting...";
      successDiv.style.display = "block";
      setTimeout(() => window.location.href = "/", 1000);
    } else {
      errorDiv.textContent = data.error || "Registration failed";
      errorDiv.style.display = "block";
    }
  } catch (err) {
    errorDiv.textContent = "Network error. Please try again.";
    errorDiv.style.display = "block";
  }
});