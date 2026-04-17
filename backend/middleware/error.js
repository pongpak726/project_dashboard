module.exports = (err, req, res, next) => {
  console.error("Check ERROR:", err);

  // known errors
  if (err.message === "User not found") {
    return res.status(404).json({ message: err.message });
  }

  if (err.message === "Password is required") {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === "Cannot assign higher role than yourself") {
    return res.status(403).json({ message: err.message });
  }

  if (err.message === "Not allowed to assign SUPER_ADMIN role") {
    return res.status(403).json({ message: err.message });
  }

  res.status(500).json({
    message: err.message || "Internal server error",
  });
};