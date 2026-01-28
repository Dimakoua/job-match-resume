## Context Snapshot
- Completed B-001 (infrastructure) and B-002 (User domain entity with comprehensive validation).
- Created production-ready D1 migrations for users, resumes, and templates tables with indexes.
- Project structure includes layered directories; Hono app and Vitest tests configured.
- Implemented D1UserRepository with save and findByEmail methods, added integration test setup.
- Completed B-004 (SignUp Service) with email uniqueness check, password hashing, and integration tests.
- Completed B-006 (Login Service) with JWT token generation and password verification.
- Completed B-007 (Login Endpoint & Auth Middleware) with POST /auth/login and protected routes.
- Completed B-008 (Google OAuth Integration) with ID token verification and user management.
- Completed B-005 (SignUp Endpoint) with POST /auth/signup and error handling.
- Completed B-009 (Resume Entity) with validation, section management, and unit tests.

## Active Task(s)
- None — All authentication and basic resume domain completed. Ready for next phase (B-010: D1 Resume Repository).

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
- Fixed database.test.js INSERT test by replacing TEMP TABLE with regular TABLE and adding DROP TABLE cleanup.
- Created Resume domain entity with validation, add/remove section methods, and 15/15 passing unit tests.

## Validation & Evidence
- Integration: SignUpUserService tests 2/2 passing, LoginUserService tests 3/3 passing, D1UserRepository tests 8/8 passing, UpdateUserService tests 13/13 passing (unit + integration), AuthController tests 9/9 passing, Database helper tests 4/4 passing (with poisoned stub handling), Domain tests 16/16 (User) + 15/15 (Resume), Controllers 7/7 passing — Total 79/79 tests passing.
- No unit tests remaining for services; all validation now through integration tests.

## Risks & Unknowns
- D1 foreign key support in production (SQLite-based, should be fine).
- Test DB setup in CI (wrangler local mode).

## Next Steps
1. Start B-010: Create D1 Resume Repository with save, findById, findAllByUserId methods.
2. Add integration tests for the repository.

## Status Summary
- ✅ 100% — B-001, B-002, B-003, B-004, B-005, B-006, B-007, B-008, B-009 complete.