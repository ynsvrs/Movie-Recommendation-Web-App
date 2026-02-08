console.log("common.js LOADED - navbar control active");

async function updateNavbar() {
  try {
    const res = await fetch('/api/auth/me', { 
      credentials: 'include' 
    });
    const data = await res.json();

    console.log("AUTH CHECK FROM NAVBAR:", data); 

    const isLoggedIn = !!data.username;
    const isAdmin = data.role === 'admin';

    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const profileLink = document.getElementById('profile-link');
    const adminLink = document.getElementById('admin-link');
    const logoutLink = document.getElementById('logout-link');

    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'block';
    if (registerLink) registerLink.style.display = isLoggedIn ? 'none' : 'block';
    if (profileLink) profileLink.style.display = isLoggedIn ? 'block' : 'none';
    if (adminLink) adminLink.style.display = isLoggedIn && isAdmin ? 'block' : 'none';
    if (logoutLink) logoutLink.style.display = isLoggedIn ? 'block' : 'none';
  } catch (err) {
    console.error("Navbar auth fetch failed:", err);
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    });
    window.location.href = '/login.html';
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
});