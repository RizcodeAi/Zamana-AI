import { config } from "dotenv";
config();

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import http from "http";
import app from "../src/index";

const PORT = 3003;
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

describe("Error Handler", () => {
  it("GET /api/nonexistent returns 404 with error object", async () => {
    const res = await request("/api/nonexistent");
    assert.strictEqual(res.statusCode, 404);
    assert.ok(res.body.error !== undefined, "Error response has error field");
    assert.strictEqual(res.body.error, "NotFound");
  });

  it("POST /api/nonexistent returns 404 for unknown routes", async () => {
    const res = await request("/api/nonexistent", "POST");
    assert.strictEqual(res.statusCode, 404);
  });
});
