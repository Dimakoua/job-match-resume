
# frontend/tracker.md

**Version:** 1.3
**Last updated:** 2026-02-05
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

## F-039 — [feature] Job Search List Management ✅ 100%
- Scope: UI for creating and managing job search lists.
- Acceptance: User can create, rename, and delete lists from the dashboard.
- Status: ✅ 100% — Completed; implemented with Clean Architecture, domain entities, use cases, repository, and Vue components with modals.

## F-040 — [feature] Job Application View ✅ 100%
- Scope: UI for viewing saved jobs within a list.
- Acceptance: User can see a list of saved jobs with their status.

## F-041 — [feature] Application Status Tracking ✅ 100%
- Scope: Implement UI to change the status of a job application.
- Acceptance: User can update the status from a dropdown (e.g., Applied, Interviewing).

## F-042 — [feature] ATS Score Display ✅ 100%
- Scope: Display the ATS score for a resume linked to a job.
- Acceptance: The score is clearly visible on the job application view.

## F-043 — [feature] Display Application Counts on Dashboard ✅ 100%
- Scope: Show the correct number of applications for each job search list.
- Acceptance: Each job search list card displays the actual application count instead of hardcoded "0".

## F-045 — [feature] Implement Saved Jobs View ✅ 100%
- Scope: Create Vue component for saved jobs list with search, filters, job cards, and tailoring modal.
- Acceptance: SavedJobs.vue created, route added, matches design, includes generate tailoring modal.

## F-046 — [feature] Implement Tailoring Studio Screen ✅ 100%
- Scope: Create AI-powered resume tailoring interface with job details, ATS scoring, and real-time resume generation.
- Acceptance:
  - useTailoringStudioController composable following Clean Architecture §3.2D
  - Job application fetching with user validation
  - Real-time ATS score calculation from resume + job description
  - AI resume generation from job description via GenerateFromJDUseCase
  - Dynamic UI with reactive data binding (no hardcoded values)
  - Loading states for all async operations
  - Error handling with user feedback
- Status: ✅ 100% — Completed; useTailoringStudioController created, TailoringStudio.vue refactored, build passes

## F-052 — [feature] Implement Generation Settings Logic + Resume Selection ✅ 100%
- Scope: Add logic to collect resume selection, tone of voice, and target ATS score from the generation modal. Include resume selection dropdown.
- Acceptance:
  - Modal state tracks selected tone, ATS score, and resume selection
  - Resume dropdown loaded with user's existing resumes; linked resume pre-selected
  - Settings passed to AI generation API
  - Backend accepts and uses tone/ATS parameters
  - Generated resume linked to job application
  - Comprehensive resume data (including custom sections) sent as formatted string, excluding UI metadata
- Status: ✅ 100% — Modal state implemented, resume selection dropdown added, comprehensive userData extraction, backend Gemini adapter fixed for JSON parsing from markdown.

## F-058 — [feature] Implement Help Center Page ✅ 100%
- Scope: Create a comprehensive Help Center page with FAQs, guides, and support information.
- Acceptance:
  - Help.vue component created with getting started, builder usage, AI features, troubleshooting
  - Route /help added to router
  - Footer link updated from placeholder to router-link
  - Page follows same design pattern as Privacy/Terms pages
- Status: ✅ 100% — Help Center page implemented, route added, footer updated, build passes

## Active Tasks

## F-053 — [feature] Resume Edit & Save in Tailoring Studio
- Scope: Enable in-line editing of resume sections within TailoringStudio with backend sync.
- Acceptance:
  - User can edit individual resume sections
  - Changes sync to backend (debounced)
  - Undo/redo buttons functional
  - Local draft saved to localStorage
- Status: 🔵 0% — Ready to start; next priority task

---

## Backlog (Next Phase)

## F-054 — [feature] Keyword Highlighting & ATS Suggestions
- Scope: Highlight job keywords in resume and show specific ATS improvement suggestions.
- Acceptance:
  - Keywords from job description highlighted in resume preview
  - AI suggests where to add/improve keywords
  - Visual indicators for matched keywords

## F-055 — [feature] Resume Download from Tailoring Studio
- Scope: Add PDF/DOCX download button in TailoringStudio with tailored version.
- Acceptance:
  - Download button exports current tailored resume
  - Supports both PDF and DOCX formats
  - Filename includes job company name

## F-056 — [feature] Save Tailored Resume as New Version
- Scope: Allow user to save the tailored resume as a new version/variant.
- Acceptance:
  - "Save as New Version" button available
  - Creates copy linked to job application
  - Version history maintained

## F-057 — [integration] End-to-End Testing
- Scope: Test complete user workflow from SavedJobs → TailoringStudio → Resume Download.
- Acceptance:
  - All data loads correctly from backend
  - ATS scores calculate accurately
  - AI generation completes without errors
  - UI responsive on desktop/tablet/mobile

---

## Status Summary
- ✅ 100% — F-003 to F-046: Infrastructure, UI, and core features complete
- ✅ 100% — F-052: Generation Settings Logic + Resume Selection complete
- 🔵 0% — F-053: Resume editing in TailoringStudio (active, ready to start)
- 🔵 0% — F-054 to F-057: Backlog features (keyword highlighting, download, versioning, e2e testing)

## Status
- Update status and completion % after each session per methodology.md §5–6
