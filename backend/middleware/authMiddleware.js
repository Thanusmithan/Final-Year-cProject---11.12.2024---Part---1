// // authMiddleware.js----------------------------Corrected-------------------------------------------
const jwt = require("jsonwebtoken");

// Middleware to verify a token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Debug log for token
  console.log("Received Token:", token);

  if (!token) {
    console.error("No token provided.");
    return res.status(401).json({ error: "No token provided. Authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to req.user
    console.log("Decoded Token:", req.user); // Debug log
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired. Please log in again." });
    }
    res.status(403).json({ error: "Invalid token. Authorization denied." });
  }
};

// Middleware to verify if the user has admin privileges
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    console.error("User not authenticated.");
    return res.status(401).json({ error: "User not authenticated." });
  }
  if (req.user.role !== "admin") {
    console.error("Access denied. Admins only.");
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// Middleware to verify specific roles
const verifyRole = (roles) => (req, res, next) => {
  if (!req.user) {
    console.error("User not authenticated.");
    return res.status(401).json({ error: "User not authenticated." });
  }
  if (!roles.includes(req.user.role)) {
    console.error(`Access denied. Required roles: ${roles.join(", ")}`);
    return res
      .status(403)
      .json({ error: `Access denied. Requires one of the following roles: ${roles.join(", ")}.` });
  }
  next();
};

// Combined middleware for admin-specific routes
const verifyAdminAccess = (req, res, next) => {
  verifyToken(req, res, () => {
    // Directly call verifyAdmin after verifying the token
    verifyAdmin(req, res, next);
  });
};

module.exports = {
  verifyToken, // General authentication
  verifyAdmin: verifyAdminAccess, // Admin-only authentication
  verifyRole, // Role-based authentication
};