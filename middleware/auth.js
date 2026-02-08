function requireUser(req, res, next) {
  if (!req.session || !req.session.user) {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.redirect("/login.html");
  }
  next();
}

function requireAdmin(req, res, next) {
  console.log("🔐 Admin check:", req.session?.user);
  
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  console.log(" Admin access granted");
  next();
}

module.exports = { requireUser, requireAdmin };