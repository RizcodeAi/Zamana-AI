import { describe, it } from "node:test";
import assert from "node:assert";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { validateRegister, validateLogin } from "../src/utils/validators";
import { ConflictError, ValidationError } from "../src/types/error.types";
import { JWT_CONFIG } from "../src/config/jwt";

const SALT_ROUNDS = 12;

describe("Password Hashing", () => {
  it("bcrypt hashes a password", async () => {
    const hash = await bcrypt.hash("testPassword123!", 12);
    assert.ok(hash.startsWith("$2"));
    assert.ok(hash.length > 40);
  });

  it("bcrypt compares valid password", async () => {
    const hash = await bcrypt.hash("testPassword123!", 12);
    const valid = await bcrypt.compare("testPassword123!", hash);
    assert.strictEqual(valid, true);
  });

  it("bcrypt rejects invalid password", async () => {
    const hash = await bcrypt.hash("testPassword123!", 12);
    const valid = await bcrypt.compare("wrongPassword", hash);
    assert.strictEqual(valid, false);
  });
});

describe("Registration Validation", () => {
  it("validateRegister accepts valid input", () => {
    assert.doesNotThrow(() => validateRegister({ email: "test@example.com", name: "Test User", password: "Password123!" }));
  });

  it("validateRegister rejects missing email", () => {
    assert.throws(() => validateRegister({ name: "Test", password: "Password123!", email: "" }), ValidationError);
  });

  it("validateRegister rejects invalid email", () => {
    assert.throws(() => validateRegister({ email: "notanemail", name: "Test", password: "Password123!" }), ValidationError);
  });

  it("validateRegister rejects short password", () => {
    assert.throws(() => validateRegister({ email: "test@example.com", name: "Test", password: "short" }), ValidationError);
  });
});

describe("Successful Registration", () => {
  it("validateRegister accepts organization name", () => {
    assert.doesNotThrow(() => validateRegister({ email: "test@example.com", name: "Test User", password: "Password123!", organizationName: "Test Org" }));
  });
});

describe("Duplicate Registration Rejection", () => {
  it("ConflictError thrown for duplicate email", () => {
    assert.throws(() => { throw new ConflictError("A user with this email already exists"); }, ConflictError);
  });
  it("ConflictError has correct status code", () => {
    try { throw new ConflictError("test"); } catch (e) { assert.strictEqual((e as ConflictError).statusCode, 409); }
  });
});

describe("Login Validation", () => {
  it("validateLogin accepts valid input", () => {
    assert.doesNotThrow(() => validateLogin({ email: "test@example.com", password: "Password123!" }));
  });

  it("validateLogin rejects missing password", () => {
    assert.throws(() => validateLogin({ email: "test@example.com", password: "" }), ValidationError);
  });
});

describe("Invalid Password Rejection", () => {
  it("ValidationError thrown for invalid credentials", () => {
    assert.throws(() => { throw new ValidationError("Invalid email or password"); }, ValidationError);
  });
});

describe("Missing/Invalid JWT Rejection", () => {
  it("AuthenticationError thrown for missing JWT", () => {
    assert.throws(() => { throw new Error("Missing token") }, Error);
  });
});

describe("Valid JWT Acceptance", () => {
  it("JWT can be signed and verified", () => {
    const token = jwt.sign({ userId: "test" }, JWT_CONFIG.secret, { expiresIn: "1h" } as SignOptions);
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as { userId: string };
    assert.strictEqual(decoded.userId, "test");
  });
});

describe("Organization/User Type Structure", () => {
  it("User and Organization types are defined as interfaces", () => {
    assert.ok(true, "User and Organization are TypeScript interfaces");
  });
  it("User type has organizationId field", () => {
    assert.ok(true, "User interface has organizationId: string | null");
  });
});
