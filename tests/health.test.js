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
                    resolve({ statusCode: res.statusCode || 0, body: JSON.parse(data) });
                }
                catch {
                    resolve({ statusCode: res.statusCode || 0, body: data });
                }
            });
        });
        req.on("error", reject);
        req.end();
    });
}
(0, node_test_1.describe)("Health Endpoint", () => {
    (0, node_test_1.it)("GET /api/health returns 200", async () => {
        const res = await request("/api/health");
        node_assert_1.default.strictEqual(res.statusCode, 200);
    });
    (0, node_test_1.it)("GET /api/health returns correct service info", async () => {
        const res = await request("/api/health");
        node_assert_1.default.strictEqual(res.body.status, "ok");
        node_assert_1.default.strictEqual(res.body.service, "zamana-ai");
        node_assert_1.default.strictEqual(res.body.version, "1.0.0");
    });
});
//# sourceMappingURL=health.test.js.map