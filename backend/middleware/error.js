module.exports = (err, req, res, next) => {
  console.error("Check ERROR:", err);

  // ===== Custom errors =====
  if (err.message === "User not found") {
    return res.status(404).json({ message: err.message });
  }

  if (err.message === "Password is required") {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === "Invalid password") {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === "User is inactive") {
    return res.status(403).json({ message: err.message });
  }

  if (err.message === "Forbidden") {
    return res.status(403).json({ message: err.message });
  }

  if (err.message === "Cannot assign higher role than yourself") {
    return res.status(403).json({ message: err.message });
  }

  if (err.message === "Not allowed to assign SUPER_ADMIN role") {
    return res.status(403).json({ message: err.message });
  }

  // ===== Prisma errors =====
  if (err.code === "P2002") {
    return res.status(400).json({ message: "Duplicate field value" });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  // ===== fallback =====
  res.status(500).json({
    message: err.message || "Internal server error",
  });
};