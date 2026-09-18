import { config } from "dotenv";
config();

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import http from "http";
import app from "../src/index";

const PORT = 3002;
let server: any;

function request(path: string, method: string = "GET"): Promise<{ statusCode: number; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "localhost", port: PORT, path, method },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode || 0, body: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode || 0, body: data });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

before(async () => {
  server = app.listen(PORT);
});

after(async () => {
  if (server && typeof server.close === "function") {
    server.close();
  }
});

describe("Health Endpoint", () => {
  it("GET /api/health returns 200", async () => {
    const res = await request("/api/health");
    assert.strictEqual(res.statusCode, 200);
  });

  it("GET /api/health returns correct service info", async () => {
    const res = await request("/api/health");
    assert.strictEqual(res.body.status, "ok");
    assert.strictEqual(res.body.service, "zamana-ai");
    assert.strictEqual(res.body.version, "1.0.0");
  });
});
