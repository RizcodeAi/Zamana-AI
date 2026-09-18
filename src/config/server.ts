import { config } from "dotenv";
config();

export const SERVER_CONFIG = {
  get port(): number { return parseInt(process.env.PORT || "3000", 10); },
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
};
