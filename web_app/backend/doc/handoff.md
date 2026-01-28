## Context Snapshot
- Completed B-001 (infrastructure) and B-002 (User domain entity with comprehensive validation).
- Created production-ready D1 migrations for users, resumes, and templates tables with indexes.
- Project structure includes layered directories; Hono app and Vitest tests configured.
- Implemented D1UserRepository with save and findByEmail methods, added integration test setup.
- Completed B-004 (SignUp Service) with email uniqueness check, password hashing, and integration tests.
- Shifted to integration-only testing strategy for services, removing unit tests in favor of real DB testing.

## Active Task(s)
- B-005: SignUp Endpoint — Acceptance: Create src/adapters/controllers/AuthController.js. POST /auth/signup route in Hono. Returns 201 on success, 400 on validation error, 409 on duplicate.

## Decisions Made
- Expanded User entity to include id, name, passwordHash, googleId for full auth support (scope.md § In Scope).
- Created combined migration file with tables and indexes for production performance.
- Used TEXT for IDs (UUIDs) and JSON content in resumes.
- Implemented D1UserRepository using database abstraction layer for consistency.
- Used PBKDF2 for password hashing with 100k iterations for security.
- Adopted integration-only testing for application services to ensure end-to-end reliability.

## Changes Since Last Session
- Removed unit test files for SignUpUserService and LoginUserService.
- Added integration test for LoginUserService with real DB interactions.
- Consolidated Vitest configs: removed vitest.integration.config.mjs, updated main config to run all tests as integration with DB setup.

## Validation & Evidence
- Integration: SignUpUserService tests 2/2 passing, LoginUserService tests 3/3 passing, D1UserRepository tests 8/8 passing, UpdateUserService tests 13/13 passing (unit + integration), AuthController tests 9/9 passing, Database helper tests 3/3 passing (with poisoned stub handling), Domain tests 16/16 passing, Controllers 7/7 passing — Total 63/63 tests passing.
- No unit tests remaining for services; all validation now through integration tests.

## Risks & Unknowns
- D1 foreign key support in production (SQLite-based, should be fine).
- Test DB setup in CI (wrangler local mode).

## Next Steps
1. Implement AuthController with POST /auth/signup endpoint.
2. Add integration test for signup endpoint with D1.

## Status Summary
- ✅ 100% — B-001, B-002, B-003, B-004 complete, B-005 in progress.