## Context Snapshot
- Completed B-001 (infrastructure) and B-002 (User domain entity with comprehensive validation).
- Created production-ready D1 migrations for users, resumes, and templates tables with indexes.
- Project structure includes layered directories; Hono app and Vitest tests configured.
- Implemented D1UserRepository with save and findByEmail methods, added integration test setup.
- Completed B-004 (SignUp Service) with email uniqueness check, password hashing, and unit tests.

## Active Task(s)
- B-005: SignUp Endpoint — Acceptance: Create src/adapters/controllers/AuthController.js. POST /auth/signup route in Hono. Returns 201 on success, 400 on validation error, 409 on duplicate.

## Decisions Made
- Expanded User entity to include id, name, passwordHash, googleId for full auth support (scope.md § In Scope).
- Created combined migration file with tables and indexes for production performance.
- Used TEXT for IDs (UUIDs) and JSON content in resumes.
- Implemented D1UserRepository using database abstraction layer for consistency.
- Used bcryptjs for password hashing with 10 salt rounds for security.

## Changes Since Last Session
- src/application/auth/SignUpService.js (+40/-0): Implemented signup logic with email check, password hashing, and user creation.
- src/application/auth/SignUpService.test.js (+50/-0): Unit tests with mocking for success and duplicate email scenarios.

## Validation & Evidence
- Unit: User tests 10/10 passing, SignUpService tests 2/2 passing — Coverage: 100% on User.js, 100% on SignUpService.js.
- Integration: D1UserRepository tests 8/8 passing (using Miniflare D1 with migrations).
- No integration tests yet for auth endpoints (pending B-005 completion).

## Risks & Unknowns
- D1 foreign key support in production (SQLite-based, should be fine).
- Test DB setup in CI (wrangler local mode).

## Next Steps
1. Implement AuthController with POST /auth/signup endpoint.
2. Add integration test for signup endpoint with D1.

## Status Summary
- ✅ 100% — B-001, B-002, B-003, B-004 complete, B-005 in progress.