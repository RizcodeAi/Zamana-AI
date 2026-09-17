# Zamana AI — Architecture Document

## Overview
Zamana AI is an AI-powered computer operator and business automation platform.

## Core Principle
"Tell your computer what you want. Zamana does the work."

## High-Level Architecture
```
USER
 |
 | Voice / Chat
 v
ZAMANA DESKTOP APP (Phase 2 — Electron)
 |
 v
ZAMANA API (this backend)
 |
 +-----------------------------+
 |                             |
 v                             v
AI ORCHESTRATOR             MEMORY
 |
 +----------------+-------------------+
 |                |                   |
 v                v                   v
COMPUTER AGENT  BROWSER AGENT     API AGENT
```

## Layer Structure
1. **Transport Layer** — Express HTTP server
2. **Security Layer** — Helmet, CORS, rate limiting, JWT auth, RBAC
3. **API Layer** — Clean REST routes
4. **Service Layer** — Business logic (auth, agents, tasks, memory)
5. **Data Layer** — Prisma + PostgreSQL
6. **AI Layer** — Provider abstraction (Phase 3+)

## Agent Architecture (Future)
- Manager Agent — orchestrates all agents
- Computer Agent — Windows desktop automation
- Browser Agent — Playwright automation
- Research Agent — data gathering
- Communication Agent — email/messaging

## Permission Levels
- Level 0: Read-only
- Level 1: Low-risk local modification
- Level 2: Communication preparation
- Level 3: Communication execution (requires approval)
- Level 4: Financial actions (requires approval)
- Level 5: Destructive actions (default deny)

## Multi-Tenancy
- Organization → Users → Agents → Memory → Audit
- Data isolation enforced server-side
- Organization IDs validated server-side, never trusted from client

## Integration Boundaries
- ExportFlow AI: External system, accessed via authenticated API only
- n8n: Workflow execution layer, triggered by Zamana via API
- No shared databases between Zamana and ExportFlow

## Environment Isolation
- Zamana must remain completely separate from ExportFlow
- Separate repo, node_modules, .env, database, git history
