export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "",
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};

if (!JWT_CONFIG.secret) {
  throw new Error("JWT_SECRET is not configured. Set JWT_SECRET in .env.");
}
