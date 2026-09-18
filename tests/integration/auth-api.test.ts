// ============================================================
// AUTH API INTEGRATION TESTS — Real HTTP + Database Integration
// Classification: A. Real HTTP/API Integration | B. Database Integration
// ============================================================
// Strategy: Single server lifecycle at module level. Test on port 3001.
// Test data is cleaned up after each describe block via Prisma.
// Never touches production data — uses unique email suffixes.
// ============================================================

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import http from "http";
import jwt from "jsonwebtoken";
import { start } from "../../src/index";
import prisma from "../../src/config/database";
import { JWT_CONFIG } from "../../src/config/jwt";

const TEST_PORT = 3001;
let server: any;
let serverStarted = false;

function request(path: string, method: string = "POST", body?: any, headers: Record<string, string> = {}): Promise<{ statusCode: number; body: any; headers: Record<string, string | string[] | undefined> }> {
  return new Promise((resolve, reject) => {
    const opts: any = { hostname: "localhost", port: TEST_PORT, path, method, headers: { "Content-Type": "application/json", ...headers } };
    const req = http.request(opts, (res: any) => {
      let data = "";
      res.on("data", (chunk: Buffer) => (data += chunk.toString()));
      res.on("end", () => {
        try { resolve({ statusCode: res.statusCode || 0, body: JSON.parse(data), headers: res.headers }); }
        catch { resolve({ statusCode: res.statusCode || 0, body: data, headers: res.headers }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 10);
}

function cleanupTestData(): Promise<void> {
  return prisma.user.deleteMany({ where: { email: { contains: "_integrationtest" } } })
    .then(() => prisma.organization.deleteMany({ where: { name: { contains: "Integration Test" } } }))
    .then(() => Promise.resolve());
}

function makeValidToken(): string {
  return jwt.sign({ userId: "testuser" }, JWT_CONFIG.secret, { expiresIn: "1h" });
}

// ============================================================
// SINGLE SERVER LIFECYCLE
// ============================================================
before(async () => {
  if (!serverStarted) {
    process.env.PORT = String(TEST_PORT);
    server = await start();
    serverStarted = true;
  }
});

after(async () => {
  await cleanupTestData();
  if (server && typeof server.close === "function") {
    server.close();
    serverStarted = false;
  }
});

// ============================================================
// A. REAL HTTP/API INTEGRATION — Registration
// ============================================================

describe("POST /api/auth/register — Real HTTP Integration", () => {
  let testEmail: string;
  let testOrgId: string;
  let testUserId: string;

  before(async () => {
    await cleanupTestData();
    testEmail = `integrationtest_${randomSuffix()}@example.com`;
  });

  after(async () => {
    await cleanupTestData();
  });

  it("1. POST /api/auth/register with valid data returns 201", async () => {
    const res = await request("/api/auth/register", "POST", {
      email: testEmail,
      name: "Integration Test User",
      password: "Password123!",
      organizationName: "Integration Test Org",
    });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data);
    assert.ok(res.body.data.user);
    assert.ok(res.body.data.tokens);
  });

  it("2. Verify organization persisted in database", async () => {
    const res = await request("/api/auth/register", "POST", {
      email: `integrationtest_org_${randomSuffix()}@example.com`,
      name: "Org User",
      password: "Password123!",
      organizationName: "Integration Test Org",
    });
    const org = await prisma.organization.findUnique({
      where: { slug: "integration-test-org" },
    });
    assert.ok(org, "Organization should exist in database");
    assert.strictEqual(org!.name, "Integration Test Org");
    testOrgId = org!.id;
  });

  it("3. Verify user persisted in database", async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    assert.ok(user, "User should exist in database");
    assert.strictEqual(user!.email, testEmail);
    assert.strictEqual(user!.name, "Integration Test User");
    assert.strictEqual(user!.role, "MEMBER");
    testUserId = user!.id;
  });

  it("4. Verify organizationId relation on user", async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    assert.ok(user!.organizationId, "User should have organizationId");
    assert.strictEqual(user!.organizationId, testOrgId);
  });

  it("5. Verify password is stored as bcrypt hash NOT plaintext", async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    assert.ok(user!.passwordHash.startsWith("$2"), "Password must be bcrypt hash starting with $2");
    assert.ok(user!.passwordHash.length > 40, "bcrypt hash must be longer than 40 chars");
    assert.notStrictEqual(user!.passwordHash, "Password123!", "Password hash must NOT equal plaintext");
  });
});

// ============================================================
// A. REAL HTTP/API INTEGRATION — Duplicate Email
// ============================================================

describe("POST /api/auth/register — Duplicate Email HTTP Integration", () => {
  let testEmail: string;

  before(async () => {
    await cleanupTestData();
    testEmail = `dupetest_${randomSuffix()}@example.com`;
    await request("/api/auth/register", "POST", {
      email: testEmail,
      name: "First User",
      password: "Password123!",
    });
  });

  after(async () => {
    await cleanupTestData();
  });

  it("6. POST /api/auth/register with duplicate email returns 409", async () => {
    const res = await request("/api/auth/register", "POST", {
      email: testEmail,
      name: "Duplicate User",
      password: "Password123!",
    });
    assert.strictEqual(res.statusCode, 409);
    assert.ok(res.body.error, "Response should have error field");
  });
});

// ============================================================
// A. REAL HTTP/API INTEGRATION — Login
// ============================================================

describe("POST /api/auth/login — Real HTTP Integration", () => {
  let registeredEmail: string;

  before(async () => {
    await cleanupTestData();
    registeredEmail = `logintest_${randomSuffix()}@example.com`;
    await request("/api/auth/register", "POST", {
      email: registeredEmail,
      name: "Login Test User",
      password: "Password123!",
    });
  });

  after(async () => {
    await cleanupTestData();
  });

  it("7. POST /api/auth/login with valid credentials returns 200 and JWT", async () => {
    const res = await request("/api/auth/login", "POST", {
      email: registeredEmail,
      password: "Password123!",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.tokens.accessToken, "Should return accessToken");
    assert.ok(res.body.data.tokens.refreshToken, "Should return refreshToken");
  });

  it("8. Verify JWT is a valid signed token", async () => {
    const res = await request("/api/auth/login", "POST", {
      email: registeredEmail,
      password: "Password123!",
    });
    const token = res.body.data.tokens.accessToken;
    assert.ok(token.startsWith("eyJ"), "JWT should start with eyJ");
    const parts = token.split(".");
    assert.strictEqual(parts.length, 3, "JWT should have 3 parts");
  });

  it("9. Invalid password returns 401", async () => {
    const res = await request("/api/auth/login", "POST", {
      email: registeredEmail,
      password: "WrongPassword!",
    });
    assert.strictEqual(res.statusCode, 401);
    assert.ok(res.body.error, "Should have error field");
  });

  it("10. Nonexistent user returns 401", async () => {
    const res = await request("/api/auth/login", "POST", {
      email: `nonexistent_${randomSuffix()}@example.com`,
      password: "Password123!",
    });
    assert.strictEqual(res.statusCode, 401);
  });

  it("11. Missing email returns 400", async () => {
    const res = await request("/api/auth/login", "POST", {
      password: "Password123!",
    });
    assert.strictEqual(res.statusCode, 400);
  });

  it("12. Missing password returns 400", async () => {
    const res = await request("/api/auth/login", "POST", {
      email: registeredEmail,
    });
    assert.strictEqual(res.statusCode, 400);
  });

  it("13. Invalid email format returns 400", async () => {
    const res = await request("/api/auth/login", "POST", {
      email: "notanemail",
      password: "Password123!",
    });
    assert.strictEqual(res.statusCode, 400);
  });
});

// ============================================================
// A. REAL HTTP/API INTEGRATION — Validation Errors
// ============================================================

describe("POST /api/auth/register — Validation Error Integration", () => {
  it("14. Weak password returns 400", async () => {
    const res = await request("/api/auth/register", "POST", {
      email: `weakpwd_${randomSuffix()}@example.com`,
      name: "Weak User",
      password: "short",
    });
    assert.strictEqual(res.statusCode, 400);
  });

  it("15. Malformed JSON returns 400", async () => {
    const res = await new Promise<{ statusCode: number; body: any }>((resolve, reject) => {
      const req = http.request(
        { hostname: "localhost", port: TEST_PORT, path: "/api/auth/register", method: "POST", headers: { "Content-Type": "application/json" } },
        (res) => {
          let data = "";
          res.on("data", (chunk: Buffer) => (data += chunk.toString()));
          res.on("end", () => {
            try { resolve({ statusCode: res.statusCode || 0, body: JSON.parse(data) }); }
            catch { resolve({ statusCode: res.statusCode || 0, body: data }); }
          });
        }
      );
      req.on("error", reject);
      req.write("{invalid json");
      req.end();
    });
    assert.strictEqual(res.statusCode, 400);
  });
});

// ============================================================
// B. DATABASE INTEGRATION — Protected Endpoint with JWT
// ============================================================

describe("GET /api/auth/me — Protected Endpoint JWT Integration", () => {
  let validToken: string;
  let registeredEmail: string;

  before(async () => {
    await cleanupTestData();
    registeredEmail = `protected_${randomSuffix()}@example.com`;
    const registerRes = await request("/api/auth/register", "POST", {
      email: registeredEmail,
      name: "Protected User",
      password: "Password123!",
    });
    validToken = registerRes.body.data.tokens.accessToken;
  });

  after(async () => {
    await cleanupTestData();
  });

  it("16. Protected endpoint with valid JWT returns 200", async () => {
    const res = await request("/api/auth/me", "GET", undefined, { Authorization: `Bearer ${validToken}` });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  it("17. Protected endpoint with missing JWT returns 401", async () => {
    const res = await request("/api/auth/me", "GET", undefined, {});
    assert.strictEqual(res.statusCode, 401);
  });

  it("18. Protected endpoint with malformed JWT returns 403", async () => {
    const res = await request("/api/auth/me", "GET", undefined, { Authorization: "Bearer not-a-valid-jwt-token" });
    assert.strictEqual(res.statusCode, 403);
  });

  it("19. Protected endpoint with invalid JWT returns 403", async () => {
    const fakeToken = jwt.sign({ userId: "fake" }, "wrongsecret", { expiresIn: "1h" });
    const res = await request("/api/auth/me", "GET", undefined, { Authorization: `Bearer ${fakeToken}` });
    assert.strictEqual(res.statusCode, 403);
  });
});

// ============================================================
// C. MIDDLEWARE — Error Handler Integration
// ============================================================

describe("Error Handler — Protected Endpoint Error Integration", () => {
  it("20. Expired JWT returns 401", async () => {
    const expiredToken = jwt.sign({ userId: "test" }, JWT_CONFIG.secret, { expiresIn: "-1h" });
    const res = await request("/api/auth/me", "GET", undefined, { Authorization: `Bearer ${expiredToken}` });
    assert.strictEqual(res.statusCode, 401);
  });

  it("21. Nonexistent endpoint returns 404", async () => {
    const res = await request("/api/auth/nonexistent", "GET", undefined, {});
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.error, "NotFound");
  });
});
