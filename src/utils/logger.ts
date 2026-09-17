const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 } as const;
type LogLevel = keyof typeof LEVELS;
const CURRENT_LEVEL: number = LEVELS[(process.env.LOG_LEVEL as LogLevel) || "info"];

export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => {
    if (CURRENT_LEVEL >= LEVELS.error) console.error(`[ERROR] ${message}`, meta ? ` ${JSON.stringify(meta)}` : "");
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (CURRENT_LEVEL >= LEVELS.warn) console.warn(`[WARN] ${message}`, meta ? ` ${JSON.stringify(meta)}` : "");
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    if (CURRENT_LEVEL >= LEVELS.info) console.info(`[INFO] ${message}`, meta ? ` ${JSON.stringify(meta)}` : "");
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (CURRENT_LEVEL >= LEVELS.debug) console.debug(`[DEBUG] ${message}`, meta ? ` ${JSON.stringify(meta)}` : "");
  },
};

export const sanitizeError = (err: Error): string => {
  if (process.env.NODE_ENV === "production") return "An internal server error occurred";
  return err.message;
};
