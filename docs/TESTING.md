# Zamana AI — Testing Strategy

## Test Framework
- **Unit Tests:** `node --test` (Node.js native test runner)
- **Integration Tests:** `node --test` + PostgreSQL test instance
- **Security Tests:** Custom tests for auth bypass, injection, escalation
- **E2E Tests:** Playwright (Phase 7+)

## Test Report Format
At the end of every test step:
```
TESTS COMPLETED: X
TESTS REMAINING: Y

COMPLETED:
- test name — PASS/FAIL

REMAINING:
- test name — status
```

## Distinguishing Test Statuses
- **tests implemented:** Written test file exists
- **tests executed:** Test was actually run
- **tests passed:** Test passed
- **tests failed:** Test failed
- **tests blocked:** Blocked by external dependency (e.g., PostgreSQL unavailable)

## Running Tests
```powershell
# Build first
npm run build

# Run all tests
npm test

# Run specific test
node --test tests/auth.unit.test.js
```

## Database Testing
If PostgreSQL is unavailable locally, database tests are BLOCKED.
Non-database tests remain runnable.

PostgreSQL setup required:
```powershell
# Install PostgreSQL, create database
createdb zamana_ai

# Then set DATABASE_URL in .env
```

## Test Categories (Required)
1. Health endpoint
2. Security headers
3. CORS behavior
4. Rate limiting behavior
5. Error handler behavior
6. Password hashing
7. Registration validation
8. Successful registration
9. Duplicate registration rejection
10. Login validation
11. Successful login
12. Invalid password rejection
13. Missing/invalid JWT rejection
14. Valid JWT acceptance
15. Organization/user database persistence
16. Tenant ownership relationship integrity
