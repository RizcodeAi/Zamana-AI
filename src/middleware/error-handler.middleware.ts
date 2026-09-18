import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/error.types";
import { logger } from "../utils/logger";
import { sanitizeError } from "../utils/logger";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "BadRequest",
      message: "Invalid JSON payload",
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.constructor.name,
      message: err.isOperational ? err.message : sanitizeError(err),
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(500).json({
    error: "InternalServerError",
    message: sanitizeError(err),
    statusCode: 500,
    timestamp: new Date().toISOString(),
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    error: "NotFound",
    message: "The requested resource was not found",
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
};
