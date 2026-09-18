import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";
import { AuthenticationError } from "../types/error.types";
import { AuthorizationError } from "../types/error.types";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Access token required");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as { userId: string };
    req.userId = decoded.userId;
    logger.debug("JWT verified", { userId: decoded.userId });
    next();
  } catch (err: any) {
    logger.warn("Invalid JWT", { error: err instanceof Error ? err.message : "unknown" });
    if (err.name === "TokenExpiredError") {
      throw new AuthenticationError("Token has expired");
    }
    throw new AuthorizationError("Invalid or corrupted token");
  }
};
