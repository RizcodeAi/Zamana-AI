"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const http_1 = __importDefault(require("http"));
function request(path, method = "GET") {
    return new Promise((resolve, reject) => {
        const req = http_1.default.request({ hostname: "localhost", port: 3000, path, method }, (res) => {
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
(0, node_test_1.describe)("Error Handler", () => {
    (0, node_test_1.it)("GET /api/nonexistent returns 404 with error object", async () => {
        const res = await request("/api/nonexistent");
        node_assert_1.default.strictEqual(res.statusCode, 404);
        node_assert_1.default.ok(res.body.error !== undefined, "Error response has error field");
        node_assert_1.default.strictEqual(res.body.error, "NotFound");
    });
    (0, node_test_1.it)("POST /api/nonexistent returns 404 for unknown routes", async () => {
        const res = await request("/api/nonexistent", "POST");
        node_assert_1.default.strictEqual(res.statusCode, 404);
    });
});
//# sourceMappingURL=error-handler.test.js.map