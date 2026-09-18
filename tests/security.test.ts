import { config } from "dotenv";
config();

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import http from "http";
import { start } from "../src/index";

let server: any;

function request(path: string, method: string = "GET", headers: Record<string, string> = {}): Promise<{ statusCode: number; headers: Record<string, string | string[] | undefined>; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "localhost", port: 3000, path, method, headers },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: data });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

before(async () => {
  server = await start();
});

after(async () => {
  if (server && typeof server.close === "function") {
    server.close();
  }
});

describe("Security Headers", () => {
  it("GET /api/health returns security headers via helmet", async () => {
    const res = await request("/api/health");
    assert.ok(res.headers["x-dns-prefetch-control"] !== undefined || res.headers["x-dns-prefetch-control"] === "off", "Helmet x-dns-prefetch-control header present");
  });

  it("GET /api/health returns x-content-type-options header", async () => {
    const res = await request("/api/health");
    assert.strictEqual(res.headers["x-content-type-options"], "nosniff");
  });

  it("GET /api/health returns x-frame-options header", async () => {
    const res = await request("/api/health");
    assert.ok(res.headers["x-frame-options"] !== undefined, "Helmet x-frame-options header present");
  });
});

describe("CORS Behavior", () => {
  it("GET /api/health returns CORS headers", async () => {
    const res = await request("/api/health");
    assert.ok(res.headers["access-control-allow-origin"] !== undefined, "CORS header present");
  });

  it("GET /api/health handles preflight with allowed methods", async () => {
    const res = await request("/api/health", "OPTIONS", { "origin": "http://localhost:3000" });
    assert.ok(res.statusCode === 200 || res.statusCode === 204, "Preflight returns success status");
  });
});

describe("Rate Limiting Behavior", () => {
  it("GET /api/health returns rate-limit headers", async () => {
    const res = await request("/api/health");
    assert.ok(
      res.headers["x-ratelimit-limit"] !== undefined ||
      res.headers["x-ratelimit-remaining"] !== undefined ||
      res.headers["ratelimit-limit"] !== undefined,
      "Rate limit headers present"
    );
  });
});
