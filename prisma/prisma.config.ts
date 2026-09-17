import { config } from "dotenv";
import { defineConfig, env } from "@prisma/config";

config();

export default defineConfig({
  schema: "./schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
