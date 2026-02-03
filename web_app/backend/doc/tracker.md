# backend/tracker.md

**Version:** 1.9
**Last updated:** 2026-01-28
**Status:** Active

---

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

## B-010 — [infra] D1 Resume Repository ✅ 100%
- Completed: 2026-01-28
- Evidence: D1ResumeRepository implemented with save, findById, findAllByUserId. Integration tests 4/4 passing.

## B-005 — [api] SignUp Endpoint ✅ 100%
- Completed: 2026-01-28
- Evidence: POST /auth/signup endpoint implemented in AuthController, returns 201 on success, 400 on validation error, 409 on duplicate.

---

## Active Tasks

## B-011 — [app] Resume CRUD Services ✅ 100%
- Completed: 2026-01-28
- Evidence: CreateResumeService and ListResumesService implemented with integration tests 3/3 passing. Services handle resume creation and listing headers.

### Phase 3: Resume Management (M2)

## B-012 — [api] Resume Controller ✅ 100%
- Completed: 2026-01-28
- Evidence: ResumeController implemented with GET /resumes and POST /resumes endpoints, protected routes, integration tests 7/7 passing.

### Phase 4: AI Integration (M3)

## B-013 — [infra] Gemini Adapter ✅ 100%
- Completed: 2026-01-28
- Evidence: GeminiAdapter implemented using @google/generative-ai SDK with generateJSON method, comprehensive error handling for API errors (429, 500), unit tests 12/12 passing.

## B-014 — [app] Generate Resume Service (Generator) ✅ 100%
- Completed: 2026-01-28
- Evidence: GenerateFromJDService implemented with comprehensive integration tests (9/9 passing). Service constructs AI prompts, validates responses, and saves generated resumes.

## B-015 — [app] Improve Text Service (Improver) ✅ 100%
- Completed: 2026-01-28
- Evidence: ImproveTextService implemented with AI-powered text improvement, returning 3 polished variations, comprehensive input validation, and integration tests (12/12 passing).

## B-016 — [api] AI Endpoints ✅ 100%
- Completed: 2026-01-28
- Evidence: POST `/resumes/generate-from-jd` and POST `/resumes/improve-text` endpoints implemented with authentication, validation, error handling, and comprehensive integration tests (13/13 passing).

### Phase 5: Export & Templates (M4 & M5)

## B-017 — [infra] PDF and DOCX Generator Adapter ✅ 100%
- Completed: 2026-01-28
- Evidence: PdfAdapter and DocxAdapter implemented with generateBuffer methods returning Uint8Array buffers, comprehensive unit tests 12/12 passing.

## B-018 — [api] Export Endpoint ✅ 100%
- Completed: 2026-01-29
- Evidence: GET `/resumes/:id/export?format=pdf|docx` endpoint implemented with ExportResumeService, proper binary responses, Content-Type and Content-Disposition headers, filename sanitization, authentication, and validation. Unit tests 10/10 passing, integration tests 4/4 passing.

## B-019 — [feature] Resume Full Update API ✅ 100%
- Completed: 2026-01-31
- Evidence: GET `/templates` endpoint implemented. PUT `/resumes/:id` endpoint fully expanded to support title, sections/content, and template_id updates with JSON object persistence. ListTemplatesService and UpdateResumeService updated with full validation and integration tests. ResumeController integration tests 15/15 passing. Domain Resume entity updated to handle object-based sections.

## B-020 — [integration] Full-Stack Integration Testing ✅ 100%
- Completed: 2026-01-31
- Evidence: Converted UpdateResumeService unit tests into full-stack integration tests using real D1 and Factory. 191/191 tests passing in the backend suite.

---

## Active Tasks

## B-021 — [infra] Cloud Storage for Exported Assets 🔵 20%
- Scope: Integrate R2 or equivalent for persisting export files (PDF/DOCX).
- Acceptance: Files saved to bucket and return signed URLs.

## B-022 — [feature] Job Search List Management ⚪ 0%
- Scope: Implement CRUD for Job Search Lists.
- Acceptance: User can create, read, update, and delete lists.

## B-023 — [feature] Job Application Management ⚪ 0%
- Scope: Implement CRUD for Job Applications, including linking to a resume and tracking status.
- Acceptance: User can save a job, link a resume, and update the application status.

## B-024 — [api] Chrome Extension Endpoint ⚪ 0%
- Scope: Create an endpoint to receive job descriptions from the Chrome extension.
- Acceptance: Endpoint securely accepts and stores job data.
