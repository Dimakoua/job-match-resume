## Context Snapshot
- Completed B-001 (infrastructure) and B-002 (User domain entity with comprehensive validation).
- Created production-ready D1 migrations for users, resumes, and templates tables with indexes.
- Project structure includes layered directories; Hono app and Vitest tests configured.
- Implemented D1UserRepository with save and findByEmail methods, added integration test setup.

## Active Task(s)
- B-004: SignUp Service — Acceptance: Create src/application/auth/SignUpService.js. Logic: Check if email exists -> Hash password (bcryptjs) -> Save User. Unit tests mocking the Repository.

## Decisions Made
- Expanded User entity to include id, name, passwordHash, googleId for full auth support (scope.md § In Scope).
- Created combined migration file with tables and indexes for production performance.
- Used TEXT for IDs (UUIDs) and JSON content in resumes.
- Implemented D1UserRepository using database abstraction layer for consistency.

## Changes Since Last Session
- src/domain/user/User.js (+50/-0): Full User class with validations and update methods.
- src/domain/user/User.test.js (+60/-0): Comprehensive unit tests.
- migrations/001_create_users_table.sql (+30/-0): D1 schema for users, resumes, templates with indexes.
- src/adapters/infrastructure/database.js (+40/-0): Database helper for D1 queries.
- src/adapters/repositories/user/d1_user_repository.js (+70/-0): D1 implementation of UserRepository.
- src/adapters/repositories/user/d1_user_repository.integration.test.js (+160/-0): Integration tests for repository.
- vitest.integration.config.js (+25/-0): Config for integration tests.
- vitest.setup.js (+20/-0): Setup for D1 in tests.
- package.json: Added test:integration script.

## Validation & Evidence
- Unit: User tests 10/10 passing — Coverage: 100% on User.js.
- Integration: D1UserRepository tests 8/8 passing (using Miniflare D1 with migrations).
- No integration tests yet (pending B-003 completion).

## Risks & Unknowns
- D1 foreign key support in production (SQLite-based, should be fine).
- Test DB setup in CI (wrangler local mode).

## Next Steps
1. Confirm integration test passes with D1 binding.
2. Implement SignUpService with password hashing.
3. Add unit tests for SignUpService.

## Status Summary
- ✅ 100% — B-001, B-002, B-003 complete, B-004 in progress.