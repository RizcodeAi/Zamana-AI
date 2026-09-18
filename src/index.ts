import { config } from "dotenv";
if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test", override: true });
} else {
  config();
}
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import prisma from "./config/database";
import { securityMiddleware } from "./config/security";
import { SERVER_CONFIG } from "./config/server";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.middleware";
import { logger } from "./utils/logger";

const app = express();

// Security foundation
app.use(securityMiddleware.helmet);
app.use(securityMiddleware.cors);
app.use(securityMiddleware.rateLimit);

// Core middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

// Health check (no auth required)
app.use("/api/health", healthRoutes);

// API routes (auth protected routes registered here)
app.use("/api/auth", authRoutes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export async function start() {
  try {
    await prisma.$connect();
    logger.info("Database connected", { provider: "postgresql" });

    const server = app.listen(SERVER_CONFIG.port, () => {
      logger.info(`Zamana AI running on port ${SERVER_CONFIG.port}`, { env: SERVER_CONFIG.nodeEnv });
    });
    return server;
  } catch (err) {
    logger.error("Failed to start server", { error: err instanceof Error ? err.message : "unknown" });
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  logger.info("SIGTERM received, database disconnected");
  process.exit(0);
});

export default app;
