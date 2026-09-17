"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const http_1 = __importDefault(require("http"));
function request(path, method = "GET", headers = {}) {
    return new Promise((resolve, reject) => {
        const req = http_1.default.request({ hostname: "localhost", port: 3000, path, method, headers }, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: JSON.parse(data) });
                }
                catch {
                    resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: data });
                }
            });
        });
        req.on("error", reject);
        req.end();
    });
}
(0, node_test_1.describe)("Security Headers", () => {
    (0, node_test_1.it)("GET /api/health returns security headers via helmet", async () => {
        const res = await request("/api/health");
        node_assert_1.default.ok(res.headers["x-dns-prefetch-control"] !== undefined || res.headers["x-dns-prefetch-control"] === "off", "Helmet x-dns-prefetch-control header present");
    });
    (0, node_test_1.it)("GET /api/health returns x-content-type-options header", async () => {
        const res = await request("/api/health");
        node_assert_1.default.strictEqual(res.headers["x-content-type-options"], "nosniff");
    });
    (0, node_test_1.it)("GET /api/health returns x-frame-options header", async () => {
        const res = await request("/api/health");
        node_assert_1.default.ok(res.headers["x-frame-options"] !== undefined, "Helmet x-frame-options header present");
    });
});
(0, node_test_1.describe)("CORS Behavior", () => {
    (0, node_test_1.it)("GET /api/health returns CORS headers", async () => {
        const res = await request("/api/health");
        node_assert_1.default.ok(res.headers["access-control-allow-origin"] !== undefined, "CORS header present");
    });
    (0, node_test_1.it)("GET /api/health handles preflight with allowed methods", async () => {
        const res = await request("/api/health", "OPTIONS", { "origin": "http://localhost:3000" });
        node_assert_1.default.ok(res.statusCode === 200 || res.statusCode === 204, "Preflight returns success status");
    });
});
(0, node_test_1.describe)("Rate Limiting Behavior", () => {
    (0, node_test_1.it)("GET /api/health returns rate-limit headers", async () => {
        const res = await request("/api/health");
        node_assert_1.default.ok(res.headers["x-ratelimit-limit"] !== undefined ||
            res.headers["x-ratelimit-remaining"] !== undefined ||
            res.headers["ratelimit-limit"] !== undefined, "Rate limit headers present");
    });
});
//# sourceMappingURL=security.test.js.map