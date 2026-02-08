function requireAuth(req, res, next) {
  if (!req.session.userId) {

    if (req.originalUrl.startsWith("/")) {
      return res.redirect("/login");
    }

    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

module.exports = requireAuth;
