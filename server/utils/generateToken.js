const jwt = require("jsonwebtoken");

/**
 * Generate JWT token and set it as an HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {string} userId - MongoDB user ID
 * @param {string} role - User role (student/admin)
 * @returns {string} Generated JWT token
 */
const generateTokenAndSetCookie = (res, userId, role) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
