
# frontend/tracker.md

**Version:** 1.0
**Last updated:** 2026-01-28
**Status:** Active

---

## Active Tasks

*None.*

---

## Backlog (Not Started)

### Phase 1: Skeleton & Setup (M1)

## F-001 — [infra] Vue 3 + Vite Project Skeleton
- Scope: Initialize Vue 3 + Vite project structure (src/, public/, main.js, App.vue).
- Acceptance criteria:
	- Project builds and runs with `npm run dev`.
	- Directory structure matches technical_design.md §3.1.

## F-002 — [infra] Tailwind CSS Setup
- Scope: Set up Tailwind CSS and configure with custom color palette.
- Acceptance criteria:
	- Tailwind classes work in components.
	- Custom colors from ui_design.md §2.1 available.

## F-003 — [infra] Pinia Store Setup
- Scope: Add Pinia store and basic state for auth and resume.
- Acceptance criteria:
	- Pinia store is available in app.
	- State for user and resume is reactive.

## F-004 — [infra] Router Setup
- Scope: Implement basic router with routes for login, dashboard, builder, and generator.
- Acceptance criteria:
	- Navigation between all main views works.
	- Route guards for auth (stub).

### Phase 2: Auth & Dashboard (M2)

## F-005 — [ui] Login Screen
- Scope: Build Login screen UI (see login_screen/code.html).
- Acceptance criteria:
	- Matches reference HTML/CSS.
	- Responsive and accessible.

## F-006 — [ui] Sign Up Screen
- Scope: Build Sign Up screen UI (see sign_up_screen/code.html).
- Acceptance criteria:
	- Matches reference HTML/CSS.
	- Responsive and accessible.

## F-007 — [ui] Google OAuth Button
- Scope: Integrate Google OAuth button (UI only, no backend).
- Acceptance criteria:
	- Button styled and placed per design.
	- No backend logic required.

## F-008 — [ui] Forgot Password Screen
- Scope: Build Forgot Password screen UI (see forgot_password_screen/code.html).
- Acceptance criteria:
	- Matches reference HTML/CSS.
	- Responsive and accessible.

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
