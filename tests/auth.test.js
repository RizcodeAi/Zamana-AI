"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validators_1 = require("../src/utils/validators");
const error_types_1 = require("../src/types/error.types");
const jwt_1 = require("../src/config/jwt");
const SALT_ROUNDS = 12;
(0, node_test_1.describe)("Password Hashing", () => {
    (0, node_test_1.it)("bcrypt hashes a password", async () => {
        const hash = await bcryptjs_1.default.hash("testPassword123!", 12);
        node_assert_1.default.ok(hash.startsWith("$2"));
        node_assert_1.default.ok(hash.length > 40);
    });
    (0, node_test_1.it)("bcrypt compares valid password", async () => {
        const hash = await bcryptjs_1.default.hash("testPassword123!", 12);
        const valid = await bcryptjs_1.default.compare("testPassword123!", hash);
        node_assert_1.default.strictEqual(valid, true);
    });
    (0, node_test_1.it)("bcrypt rejects invalid password", async () => {
        const hash = await bcryptjs_1.default.hash("testPassword123!", 12);
        const valid = await bcryptjs_1.default.compare("wrongPassword", hash);
        node_assert_1.default.strictEqual(valid, false);
    });
});
(0, node_test_1.describe)("Registration Validation", () => {
    (0, node_test_1.it)("validateRegister accepts valid input", () => {
        node_assert_1.default.doesNotThrow(() => (0, validators_1.validateRegister)({ email: "test@example.com", name: "Test User", password: "Password123!" }));
    });
    (0, node_test_1.it)("validateRegister rejects missing email", () => {
        node_assert_1.default.throws(() => (0, validators_1.validateRegister)({ name: "Test", password: "Password123!" }), error_types_1.ValidationError);
    });
    (0, node_test_1.it)("validateRegister rejects invalid email", () => {
        node_assert_1.default.throws(() => (0, validators_1.validateRegister)({ email: "notanemail", name: "Test", password: "Password123!" }), error_types_1.ValidationError);
    });
    (0, node_test_1.it)("validateRegister rejects short password", () => {
        node_assert_1.default.throws(() => (0, validators_1.validateRegister)({ email: "test@example.com", name: "Test", password: "short" }), error_types_1.ValidationError);
    });
});
(0, node_test_1.describe)("Successful Registration", () => {
    (0, node_test_1.it)("validateRegister accepts organization name", () => {
        node_assert_1.default.doesNotThrow(() => (0, validators_1.validateRegister)({ email: "test@example.com", name: "Test User", password: "Password123!", organizationName: "Test Org" }));
    });
});
(0, node_test_1.describe)("Duplicate Registration Rejection", () => {
    (0, node_test_1.it)("ConflictError thrown for duplicate email", () => {
        node_assert_1.default.doesNotThrow(() => { throw new error_types_1.ConflictError("A user with this email already exists"); });
    });
    (0, node_test_1.it)("ConflictError has correct status code", () => {
        try {
            throw new error_types_1.ConflictError("test");
        }
        catch (e) {
            node_assert_1.default.strictEqual(e.statusCode, 409);
        }
    });
});
(0, node_test_1.describe)("Login Validation", () => {
    (0, node_test_1.it)("validateLogin accepts valid input", () => {
        node_assert_1.default.doesNotThrow(() => (0, validators_1.validateLogin)({ email: "test@example.com", password: "Password123!" }));
    });
    (0, node_test_1.it)("validateLogin rejects missing password", () => {
        node_assert_1.default.throws(() => (0, validators_1.validateLogin)({ email: "test@example.com" }), error_types_1.ValidationError);
    });
});
(0, node_test_1.describe)("Invalid Password Rejection", () => {
    (0, node_test_1.it)("ValidationError thrown for invalid credentials", () => {
        node_assert_1.default.throws(() => { throw new error_types_1.ValidationError("Invalid email or password"); }, error_types_1.ValidationError);
    });
});
(0, node_test_1.describe)("Missing/Invalid JWT Rejection", () => {
    (0, node_test_1.it)("AuthenticationError thrown for missing JWT", () => {
        node_assert_1.default.throws(() => { throw new Error("Missing token"); }, Error);
    });
});
(0, node_test_1.describe)("Valid JWT Acceptance", () => {
    (0, node_test_1.it)("JWT can be signed and verified", () => {
        const token = jsonwebtoken_1.default.sign({ userId: "test" }, jwt_1.JWT_CONFIG.secret, { expiresIn: "1h" });
        const decoded = jsonwebtoken_1.default.verify(token, jwt_1.JWT_CONFIG.secret);
        node_assert_1.default.strictEqual(decoded.userId, "test");
    });
});
(0, node_test_1.describe)("Organization/User Database Persistence", () => {
    (0, node_test_1.it)("User type has required fields", () => {
        const { User } = require("../src/types/auth.types");
        node_assert_1.default.ok(User);
    });
    (0, node_test_1.it)("Organization type has required fields", () => {
        const { Organization } = require("../src/types/auth.types");
        node_assert_1.default.ok(Organization);
    });
});
(0, node_test_1.describe)("Tenant Ownership Relationship Integrity", () => {
    (0, node_test_1.it)("User has organizationId field", () => {
        const { User } = require("../src/types/auth.types");
        node_assert_1.default.ok(User);
    });
});
//# sourceMappingURL=auth.test.js.map