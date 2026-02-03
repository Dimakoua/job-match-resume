# scope.md

**Version:** 1.0
**Last updated:** 2026-01-27
**Status:** Active — defines frontend boundaries and success criteria

---

## Purpose

This document defines the functional boundaries, user experience goals, and technical deliverables for the AI Resume Builder Frontend. It focuses on the client-side application (SPA) that interacts with the Backend API.

---

## Vision

The Frontend provides a "Professional Studio" environment. It abstracts the complexity of formatting and layout, allowing the user to focus purely on content.

**The Problem:** Traditional resume editors are Clunky (Word) or Rigid (Forms). Users struggle to visualize how their text fits into a page while typing.
**The Solution:** A reactive "Split-Screen" interface for resume building, and a comprehensive dashboard for tracking job applications. On the left of the builder: intuitive forms and AI tools. On the right: A real-time, pixel-perfect preview of the final document. The dashboard will allow users to manage their job searches, link tailored resumes, and track their progress.

---

## Goals (what success looks like)

- **Real-Time Preview:** As the user types in the form, the resume preview updates instantly.
- **AI Accessibility:** AI features (Improve Text, Generate from JD) are embedded directly into the workflow, not hidden in a separate menu.
- **Professional Aesthetics:** The UI itself (dashboard, buttons, forms) feels as professional as the resumes it produces.
- **Seamless Export:** One-click download for PDF and DOCX.
- **Job Application Tracking:** A clear and organized way to manage the job application pipeline.

---

## Success Metrics (SLOs)

- **First Input Delay (FID):** ≤ 100ms (Typing must feel instant).
- **Preview Latency:** Resume preview updates ≤ 50ms after user stops typing (debounced).
- **Lighthouse Performance:** Score ≥ 90.
- **AI Response Handling:** specific UI states (skeletons/spinners) for all AI loading times > 1s.

---

## In Scope

**Core Features (UI):**
- **Auth Flow:**
    - Login/Signup (Email & Password).
    - Google OAuth Button integration.
- **Job Tracking Dashboard:**
    - View and manage job search lists (e.g., "2025 Job Hunt").
    - View saved jobs within those lists.
    - Track application status (Saved, Applied, Interview, etc.).
    - Link a specific resume version to a job application.
- **The Builder (Main View):**
    - **Split Layout:** Form Editor (Left) + Document Preview (Right).
    - **Form Sections:** Personal Info, Experience, Education, Skills, Custom.
    - **Template Switcher:** Sidebar to swap visual themes instantly.
    - **AI Improver:** "Magic Wand" button next to text areas to grammar check/expand text.
- **The Generator (Job Description View):**
    - A dedicated wizard view: User pastes JD -> AI builds structure -> Redirects to Builder.
- **Export:**
    - Download actions triggering Backend API endpoints.

**Technical Deliverables:**
- Single Page Application (SPA) built with **Vue 3 (Composition API) & Vite**.
- Styling with **Tailwind CSS**.
- State Management using **Pinia** (for handling complex Resume JSON objects).
- API Client module (Axios or Fetch wrapper).

---

## Out of Scope

- **Mobile Editing:** The *Dashboard* will be mobile-responsive (for viewing/downloading), but the *Builder/Editor* is optimized for **Desktop/Tablet** screens. Editing a complex multi-column resume on a phone is a non-goal for MVP.
- **Offline Mode:** The app requires an internet connection to sync with the Backend and AI services.
- **Client-Side PDF Generation:** We will rely on the Backend to generate the binary files to ensure consistency across browsers.

---

## Constraints & Assumptions

**Constraints:**
- **Stack:** Vue 3, Vite, Tailwind CSS.
- **Hosting:** Cloudflare Pages.
- **Design System:** Must use a clean, professional component library (e.g., Headless UI or Shadcn-Vue) to ensure "clean and professional" look.

**Assumptions:**
- Users prefer a "Live Preview" over a "WYSIWYG" (clicking directly on the paper) approach, as it keeps data structure cleaner.

---

## Milestones (target dates)

- **M1: Skeleton:** Project setup, Router, Pinia Store setup, Auth Layout. — Target: Day 1
- **M2: Dashboard & Auth:** Login, Google Auth, List Resumes. — Target: Day 2
- **M3: Builder Core:** Split-screen layout, Real-time preview rendering, Form inputs. — Target: Day 3
- **M4: AI Integration:** UI for "Paste JD" wizard and "Improve Text" popovers. — Target: Day 4
- **M5: Polish & Export:** Template switching logic, Export buttons, Loading states. — Target: Day 5

---

## Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-27 | 1.0 | Initial scope defined | AI Assistant |