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
- Completed B-010 (D1 Resume Repository) with save, findById, findAllByUserId methods and integration tests.
- Completed B-011 (Resume CRUD Services) with CreateResumeService and ListResumesService, integration tests.
- Completed B-012 (Resume Controller) with GET /resumes and POST /resumes endpoints, protected routes, and integration tests.

## Active Task(s)
- None — Resume Controller completed. Ready for next phase (AI Integration).

## Decisions Made
- Expanded User entity to include id, name, passwordHash, googleId for full auth support (scope.md § In Scope).
- Created combined migration file with tables and indexes for production performance.
- Used TEXT for IDs (UUIDs) and JSON content in resumes.
- Implemented D1UserRepository using database abstraction layer for consistency.
- Used PBKDF2 for password hashing with 100k iterations for security.
- Adopted integration-only testing for application services to ensure end-to-end reliability.
- Implemented template system with static hardcoded data in domain repository, eliminating unnecessary database abstraction for immutable template data.
- Maintained repository pattern interface while using static data for templates to keep clean separation of concerns.
- Implemented ResumeController following same patterns as AuthController with proper error handling and response formatting.

## Changes Since Last Session
- Created D1ResumeRepository with save, findById, findAllByUserId methods.
- Added integration tests for D1ResumeRepository using D1UserRepository for user setup.
- Fixed test issues: used factories for user creation, added templateId to Resume constructor calls, removed skip conditions.
- Updated Resume entity to include templateId in constructor and validation.
- Implemented CreateResumeService and ListResumesService with integration tests.
- Removed unit tests for services, following integration-only testing strategy.
- Updated Resume entity and repository to include timestamps (createdAt, updatedAt).
- Implemented TemplateRepository with 7 static templates using repository pattern.
- Added comprehensive unit tests for Template entity (10/10 passing) covering all validation scenarios.
- Updated Factory class to include templateRepo and fakeTemplate method for testing.
- Implemented ResumeController with createResume and listResumes methods, following BaseController patterns.
- Added resume routes to router.js and created resume_routes.js with protected endpoints.
- Created comprehensive integration tests for ResumeController (7/7 passing) covering success cases, validation, and authentication.

## Validation & Evidence
- Integration: SignUpUserService tests 2/2 passing, LoginUserService tests 3/3 passing, D1UserRepository tests 8/8 passing, UpdateUserService tests 13/13 passing (unit + integration), AuthController tests 9/9 passing, Database helper tests 4/4 passing (with poisoned stub handling), Domain tests 16/16 (User) + 17/17 (Resume) + 10/10 (Template), Controllers 7/7 (Auth) + 7/7 (Resume), D1ResumeRepository integration tests 4/4 passing, Resume Services integration tests 6/6 passing — Total 115/115 tests passing.
- Template functionality validated through resume creation integration tests including professional template sections.
- All template domain tests passing (14/14 total including factory tests).
- Resume Controller endpoints tested with authentication, validation, and business logic.

## Risks & Unknowns
- D1 foreign key support in production (SQLite-based, should be fine).
- Test DB setup in CI (wrangler local mode).

## Next Steps
1. Start Phase 4: AI Integration with B-013 (Gemini Adapter).
2. Implement external API communication for AI-powered resume features.

## Status Summary
- ✅ 100% — B-001, B-002, B-003, B-004, B-005, B-006, B-007, B-008, B-009, B-010, B-011, B-012 complete. Resume management API fully implemented and tested.