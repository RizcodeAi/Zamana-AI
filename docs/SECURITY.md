# Zamana AI — Security Document

## Security Posture
Zamana is treated as a security-sensitive application.

## Implemented Security Controls
1. **Helmet** — Secure HTTP headers (HSTS, XSS, CSP, etc.)
2. **CORS** — Explicit origin configuration, not permissive
3. **Rate Limiting** — Per-IP request throttling
4. **JWT Authentication** — Token-based auth with env-var secrets
5. **Password Hashing** — bcrypt with 12 salt rounds
6. **Input Validation** — Email, password, name validation before processing
7. **Centralized Error Handling** — No stack traces leaked in production
8. **Request Size Limiting** — JSON body limited to 10kb
9. **Audit Logging** — Every auth event logged

## Security Rules
- NEVER store plaintext passwords
- NEVER commit `.env` to git
- NEVER expose API keys in source code
- NEVER log passwords, tokens, or secrets
- NEVER trust organization IDs from the client
- NEVER expose database internals in API responses
- NEVER allow unrestricted shell execution
- NEVER put secrets in frontend code
- NEVER allow LLM to bypass permission engine

## Prompt Injection Defense
External content (webpages, emails, documents) is treated as UNTRUSTED.
User instructions and external content must be architecturally separated.
External content must NEVER override system/user policy.

## Environment Configuration
- `JWT_SECRET` must be a strong random string (min 32 chars)
- `DATABASE_URL` must not be shared between projects
- `CORS_ORIGIN` must be explicitly set, not left to default
- All secrets loaded from `.env`, never hardcoded

## ExportFlow Isolation
- Zamana never directly accesses ExportFlow's database
- Integration must be through documented authenticated API boundary
- No filesystem dependencies between projects
- No shared node_modules, .env, or configuration
