# backend/tracker.md

**Version:** 1.6
**Last updated:** 2026-01-28
**Status:** Active

---

## Active Tasks

## B-005 — [api] SignUp Endpoint
- Scope: HTTP layer.
- Acceptance criteria:
  - Create `src/adapters/controllers/AuthController.js`.
  - POST `/auth/signup` route in Hono.
  - Returns 201 on success, 400 on validation error, 409 on duplicate.

---

## Completed Tasks

## B-001 — [infra] Project Skeleton & Hono Setup ✅ 100%
- Completed: 2026-01-28
- Evidence: npm install succeeded, npm test passed, wrangler dev started.

## B-002 — [domain] User Entity & Validation ✅ 100%
- Completed: 2026-01-28
- Evidence: User.js with full validation, User.test.js passing all tests.

## B-003 — [infra] D1 User Table & Repository ✅ 100%
- Completed: 2026-01-28
- Evidence: D1 migration exists, D1UserRepository implemented with save and findByEmail, integration tests 8/8 passing.

## B-004 — [app] SignUp Service ✅ 100%
- Completed: 2026-01-28
- Evidence: SignUpService implemented with email uniqueness check, bcrypt password hashing, and user creation. Unit tests 2/2 passing.

## B-006 — [app] Login Service & JWT ✅ 100%
- Completed: 2026-01-28
- Evidence: LoginService implemented with JWT token generation and password verification. Integration tests 3/3 passing.

## B-007 — [api] Login Endpoint & Auth Middleware ✅ 100%
- Completed: 2026-01-28
- Evidence: POST /auth/login endpoint implemented in AuthController, returns JWT token. Hono middleware created to protect /api/* routes.

## B-008 — [feature] Google OAuth Integration ✅ 100%
- Completed: 2026-01-28
- Evidence: Google OAuth endpoints implemented (/auth/google, /auth/google/callback, /auth/google/login) with ID token verification and user creation/finding.

---

## Backlog (Not Started)

### Phase 1: Foundation & Infrastructure (M1)

## B-001 — [infra] Project Skeleton & Hono Setup
- Scope: Setup minimal Hono app + Vitest + Wrangler.
- Acceptance criteria:
  - `npm install` runs without errors.
  - `npm test` passes a "Hello World" test.
  - `wrangler dev` starts the server locally.
  - Directory structure created: `src/domain`, `src/application`, `src/adapters`.

### Phase 2: User Authentication (M1)

## B-002 — [domain] User Entity & Validation
- Scope: Core User logic.
- Acceptance criteria:
  - Create `src/domain/user/User.js`.
  - Validate email format and password length in constructor.
  - Unit tests for valid/invalid Users.

## B-003 — [infra] D1 User Table & Repository
- Scope: Database persistence.
- Acceptance criteria:
  - Create D1 migration SQL: `CREATE TABLE users...`.
  - Create `src/adapters/repositories/D1UserRepository.js`.
  - Implement `save(user)` and `findByEmail(email)`.
  - Integration test using Miniflare D1.

### Phase 3: Resume Management (M2)

## B-009 — [domain] Resume Entity
- Scope: Resume data structure.
- Acceptance criteria:
  - `src/domain/resume/Resume.js`.
  - Logic to add/remove sections (Experience, Education).
  - Resume must belong to a `userId`.

## B-010 — [infra] D1 Resume Repository
- Scope: Persist complex JSON data.
- Acceptance criteria:
  - Migration: `CREATE TABLE resumes (..., content JSON, template_id TEXT)`.
  - Repository methods: `save`, `findById`, `findAllByUserId`.

## B-011 — [app] Resume CRUD Services
- Scope: Create and List logic.
- Acceptance criteria:
  - `CreateResumeService`: Initializes empty/template resume.
  - `ListResumesService`: Returns headers (id, title, updated_at) for dashboard.

## B-012 — [api] Resume Controller
- Scope: Connect REST to Services.
- Acceptance criteria:
  - GET `/resumes` (Protected).
  - POST `/resumes` (Protected).
  - GET `/resumes/:id` (Protected, verifies ownership).

### Phase 4: AI Integration (M3)

## B-013 — [infra] Gemini Adapter
- Scope: External API communication.
- Acceptance criteria:
  - `src/adapters/ai/GeminiAdapter.js`.
  - Method `generateJSON(systemPrompt, userPrompt)`.
  - Handles API errors (429, 500) gracefully.

## B-014 — [app] Generate Resume Service (Generator)
- Scope: scope.md § AI Features (Generator).
- Acceptance criteria:
  - `GenerateFromJDService`.
  - Logic: Construct prompt -> Call Adapter -> Parse JSON -> Create Resume Entity.

## B-015 — [app] Improve Text Service (Improver)
- Scope: scope.md § AI Features (Improver).
- Acceptance criteria:
  - `ImproveTextService`.
  - Logic: Takes a text block (e.g., "I worked on sales") -> Returns 3 polished variations.

## B-016 — [api] AI Endpoints
- Scope: Public facing AI routes.
- Acceptance criteria:
  - POST `/resumes/generate-from-jd` (Full resume).
  - POST `/resumes/improve-text` (Specific section).

### Phase 5: Export & Templates (M4 & M5)

## B-017 — [infra] PDF and DOCX Generator Adapter
- Scope: scope.md § Export (PDF, DOCX).
- Design: design.md §7.1 (ADR-001 - Pure JS PDF), extend for DOCX.
- Acceptance criteria:
  - `src/adapters/pdf/PdfKitAdapter.js` (or `pdf-lib`) for PDF.
  - `src/adapters/docx/DocxAdapter.js` (using docx library) for DOCX.
  - Method `generateBuffer(resumeData)` for both.
  - Returns a binary buffer (Uint8Array).

## B-018 — [api] Export Endpoint
- Scope: HTTP Response with Binary.
- Acceptance criteria:
  - GET `/resumes/:id/export?format=pdf` or `?format=docx`.
  - Sets Header `Content-Type: application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
  - Sets Header `Content-Disposition: attachment; filename="..."`.

## B-019 — [feature] Template Metadata API
- Scope: scope.md § Template System.
- Acceptance criteria:
  - GET `/templates` returns list of available template IDs and names.
  - PUT `/resumes/:id` allows updating `template_id`.

---