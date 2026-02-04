
# frontend/tracker.md

**Version:** 1.2
**Last updated:** 2026-01-31
**Status:** Active

---

## Completed Tasks

## F-003 — [infra] Pinia Store Setup ✅ 100%
- State for user and resume is reactive.

## F-004 — [infra] Router Setup ✅ 100%
- Navigation between all main views works.

## F-005 — [ui] Login Screen ✅ 100%
- Matches reference HTML/CSS.

## F-006 — [ui] Sign Up Screen ✅ 100%
- Responsive and accessible.

## F-008 — [ui] Forgot Password Screen ✅ 100%
- Form handling complete.

## F-009 — [ui] Resume Dashboard ✅ 100%
- Grid view with "Create New" options.

## F-010 — [ui] Split-Screen Builder Layout ✅ 100%
- Editor (left) and Preview (right).

## F-011-F-015 — [ui] Resume Form Sections ✅ 100%
- Personal Info, Experience, Education, Skills, Projects, Certifications.

## F-016 — [ui] Real-Time Preview ✅ 100%
- Live rendering with reactive data merging.

## F-017 — [ui] Template Switcher ✅ 100%
- Sidebar with 7 layout styles.

## F-018 — [ui] AI Generator Wizard ✅ 100%
- 3-step wizard (JD -> Template -> Result).

## F-019 — [ui] AI "Magic Wand" Improver ✅ 100%
- Inline LLM enhancements for summaries/experience.

## F-025 — [integration] Set up API Client ✅ 100%
- Axios interceptors for auth & token management.

## F-026 — [integration] Login with Backend ✅ 100%
- Real JWT auth flow.

## F-032 — [ui] Version History Sidebar ✅ 100%
- Local snapshots with restoration.

## F-033 — [infra] Local Storage Draft Architecture ✅ 100%
- Instant persistence for browser crashes.

## F-034 — [integration] Dual-Layer Auto-save ✅ 100%
- Local Draft + 5s Debounced Backend Sync.

## F-035 — [ui] Sync Status Indicators ✅ 100%
- "Saved", "Unsaved", and "Syncing..." pulsing status.

---

## Active Tasks

## F-036 — [integration] Export to DOCX 🔵 10%
- Scope: Trigger .docx generation from Builder UI.
- Acceptance: Download matches preview structure.

## F-036 — [integration] Export to DOCX ✅ 100%
- Scope: Trigger .docx generation from Builder UI.
- Acceptance: Download matches preview structure.

## F-037 — [ui] PDF Download Implementation ⚪ 0%
- Scope: Connect download button to backend PDF service.

## F-037 — [ui] PDF Download Implementation ✅ 100%
- Scope: Connect download button to backend PDF service.

## F-038 — [ui] Dashboard Resume Actions 🔵 40%
- Scope: Implement Preview, Duplicate, and Delete.

## F-038 — [ui] Dashboard Resume Actions ✅ 100%
- Scope: Implement Preview, Duplicate, and Delete.

## F-039 — [feature] Job Search List Management ⚪ 0%
- Scope: UI for creating and managing job search lists.
- Acceptance: User can create, rename, and delete lists from the dashboard.

## F-040 — [feature] Job Application View ⚪ 0%
- Scope: UI for viewing saved jobs within a list.
- Acceptance: User can see a list of saved jobs with their status.

## F-041 — [feature] Application Status Tracking ⚪ 0%
- Scope: Implement UI to change the status of a job application.
- Acceptance: User can update the status from a dropdown (e.g., Applied, Interviewing).

## F-042 — [feature] ATS Score Display ⚪ 0%
- Scope: Display the ATS score for a resume linked to a job.
- Acceptance: The score is clearly visible on the job application view.

---

## Completed Tasks

## F-003 — [infra] Pinia Store Setup
- Scope: Add Pinia store and basic state for auth and resume.
- Acceptance criteria:
	- Pinia store is available in app.
	- State for user and resume is reactive.
- Status: ✅ 100% — Completed in previous session.

## F-004 — [infra] Router Setup
- Scope: Implement basic router with routes for login, dashboard, builder, and generator.
- Acceptance criteria:
	- Navigation between all main views works.
	- Route guards for auth (stub).
- Status: ✅ 100% — Completed in this session.

## F-005 — [ui] Login Screen
- Scope: Build Login screen UI (see login_screen/code.html).
- Acceptance criteria:
	- Matches reference HTML/CSS.
	- Responsive and accessible.
- Status: ✅ 100% — Completed in this session.

## F-006 — [ui] Sign Up Screen
- Scope: Build Sign Up screen UI (see sign_up_screen/code.html).
- Acceptance criteria:
	- Matches reference HTML/CSS.
	- Responsive and accessible.
- Status: ✅ 100% — Completed; matches reference with form handling and Google OAuth button.

## F-007 — [ui] Google OAuth Button
- Scope: Integrate Google OAuth button (UI only, no backend).
- Acceptance criteria:
	- Button styled and placed per design.
	- No backend logic required.
- Status: ✅ 100% — Completed; included in Signup screen.

## F-008 — [ui] Forgot Password Screen
- Scope: Build Forgot Password screen UI (see forgot_password_screen/code.html).
- Acceptance criteria:
	- Matches reference HTML/CSS.
	- Responsive and accessible.
- Status: ✅ 100% — Completed; matches reference with form handling.

## F-025 — [integration] Set up API Client
- Scope: Create Axios/fetch wrapper for backend API calls with error handling and auth headers.
- Acceptance criteria:
	- API client module available.
	- Handles JWT tokens, base URL from env.
- Status: ✅ 100% — Completed; Axios client configured with interceptors for auth and 401 handling.

## F-026 — [integration] Integrate Login with Backend
- Scope: Connect login form to /api/auth/login endpoint.
- Acceptance criteria:
	- Successful login stores JWT, redirects to dashboard.
	- Error handling for invalid credentials.
- Status: ✅ 100% — Completed; Login.vue uses useAuthController with LoginUseCase, handles loading and errors.

## Backlog (Not Started)

### Phase 1: Skeleton & Setup (M1)

## F-004 — [infra] Router Setup
- Scope: Implement basic router with routes for login, dashboard, builder, and generator.
- Acceptance criteria:
	- Navigation between all main views works.
	- Route guards for auth (stub).

### Phase 2: Auth & Dashboard (M2)



## F-009 — [ui] Resume Dashboard
- Scope: Build Resume Dashboard UI (see resume_builder_dashboard/code.html).
- Acceptance criteria:
	- Grid view of resumes with thumbnails.
	- "Create New" options present.

### Phase 3: Builder Core (M3)

## F-010 — [ui] Split-Screen Builder Layout
- Scope: Implement split-screen layout for Builder (form left, preview right).
- Acceptance criteria:
	- Layout matches design in code.html.
	- Responsive for desktop/tablet.

## F-011 — [ui] Personal Info Form Section
- Scope: Build Personal Info form section (UI only).
- Acceptance criteria:
	- Section present in builder form.
	- Matches reference HTML/CSS.

## F-012 — [ui] Experience Form Section
- Scope: Build Experience form section (UI only).
- Acceptance criteria:
	- Section present in builder form.
	- Matches reference HTML/CSS.

## F-013 — [ui] Education Form Section
- Scope: Build Education form section (UI only).
- Acceptance criteria:
	- Section present in builder form.
	- Matches reference HTML/CSS.

## F-014 — [ui] Skills Form Section
- Scope: Build Skills form section (UI only).
- Acceptance criteria:
	- Section present in builder form.
	- Matches reference HTML/CSS.

## F-015 — [ui] Custom Form Section
- Scope: Build Custom section (UI only).
- Acceptance criteria:
	- Section present in builder form.
	- Matches reference HTML/CSS.

## F-016 — [ui] Real-Time Preview Component
- Scope: Implement real-time preview component (static data).
- Acceptance criteria:
	- Preview updates as form changes (static data for now).
	- Matches design.

## F-017 — [ui] Template Switcher Sidebar
- Scope: Add template switcher sidebar (UI only).
- Acceptance criteria:
	- Sidebar present and styled.
	- No switching logic required yet.

### Phase 4: AI Integration (M4)

## F-018 — [ui] AI Resume Generator Wizard
- Scope: Build AI Resume Generator Wizard UI (see ai_resume_generator_wizard/code.html).
- Acceptance criteria:
	- Matches reference HTML/CSS.
	- Handles JD input and next step button.

## F-019 — [ui] "Magic Wand" AI Improver Button
- Scope: Add "Magic Wand" AI improver button to text areas (UI only).
- Acceptance criteria:
	- Button present next to text areas.
	- No backend logic required.

## F-020 — [ui] AI Loading Skeleton/Spinner
- Scope: Show loading skeleton/spinner for AI actions.
- Acceptance criteria:
	- Spinner/skeleton visible during AI actions (stub logic).

### Phase 5: Polish & Export (M5)

## F-021 — [ui] Export Buttons (PDF/DOCX)
- Scope: Implement export buttons (PDF/DOCX, UI only).
- Acceptance criteria:
	- Buttons present and styled.
	- No backend logic required.

## F-022 — [ui] Loading States for Async Actions
- Scope: Add loading states for all async actions.
- Acceptance criteria:
	- All async UI actions show loading state (stub logic).

## F-023 — [ui] Theme Switcher & Dark Mode
- Scope: Polish theme switcher and ensure Tailwind dark mode support.
- Acceptance criteria:
	- Theme switcher present and works for Tailwind dark mode.

## F-024 — [ui] UI Review & Alignment
- Scope: Review and align all UI with reference HTML/CSS in stitch_resume_builder_dashboard.
- Acceptance criteria:
	- All screens match reference implementation.

---

## Status
- Update status and completion % after each session per methodology.md §5–6
