# scope.md

**Version:** 1.0
**Last updated:** 2026-01-27
**Status:** Active — defines project boundaries and success criteria

---

## Purpose

This document defines what we're building, why we're building it, what success looks like, and what's explicitly out of scope for the AI-Driven Resume Builder Backend. It serves as the primary agreement between stakeholders and developers.

---

## Vision

The "AI Resume Builder" aims to democratize professional career advancement by combining clean design with AI-driven content optimization.

**The Problem:** Job seekers struggle to format resumes professionally, often fail to tailor content to specific job descriptions (JD), and lack objective feedback on their writing.

**The Solution:** A web-based platform where users can manage resume data, use AI to analyze existing content, or generate completely new tailored resumes by pasting a JD.

**Approach:** A secure, high-performance REST API built on Cloudflare Workers and D1, utilizing a strict Layered Architecture to separate AI orchestration from core business logic.

---

## Goals (what success looks like)

- **Professional Output:** Users can export resumes in PDF and DOCX formats that pass ATS (Applicant Tracking Systems) and look professional.
- **AI Assistance:** The system provides actionable feedback (Analyze Mode) and generates targeted content (Build Mode) based on raw input.
- **User Ownership:** Users can manage multiple versions of their resume for different job applications.
- **Architectural Purity:** The backend follows a strict Layered Architecture (Domain, Application, Adapters) to ensure long-term maintainability.
- **Security:** Secure authentication via Email/Pass and Google OAuth.

---

## Success Metrics (SLOs)

- **API Latency:** P95 response time ≤ 200ms for CRUD operations.
- **AI Latency:** P95 response time ≤ 5s for AI analysis/generation (dependent on LLM provider).
- **Test Coverage:** ≥ 90% code coverage for Domain and Application layers.
- **Export Fidelity:** 100% formatting consistency between Preview and Exported PDF.
- **Setup Time:** New developer can deploy the full backend stack in < 15 minutes.

---

## In Scope

**Core Features:**
- **User Management:** Sign up (Email/Pass, Google OAuth), Login (JWT).
- **Resume Management:** CRUD operations for Resumes (Personal details, Experience, Education, Skills).
- **Template System:** Backend support for selecting and applying different design templates.
- **AI Features:**
    1.  **Improver:** Analyze current resume text and suggest improvements.
    2.  **Generator:** Accept raw requirements + Job Description and generate a full resume structure.
- **Export:** Generate PDF and DOCX files.

**Technical Deliverables:**
- REST API deployed on Cloudflare Workers.
- Database schema and migrations for Cloudflare D1.
- Unit and Integration test suites.
- Integration with an AI Provider (e.g., Google Gemini/OpenAI/Anthropic) via Adapters.

---

## Out of Scope (for now)

- **Job Board Integration:** No direct applying to LinkedIn/Indeed.
- **Cover Letter Generator:** Focused strictly on Resumes for MVP.
- **Hosting User Websites:** We are not hosting "personal portfolio sites," just document generation.
- **OCR:** We will not parse existing PDF uploads (Resume Parsing) in this phase; manual entry or AI generation only.
- **Payment Processing:** The app is free-tier for now.

---

## Constraints & Assumptions

**Constraints:**
- **Infrastructure:** Must use Cloudflare Workers and D1 (SQLite).
- **Architecture:** Must strictly follow the provided Layered Architecture (Domain, Application, Adapters).
- **Exporting:** PDF generation must happen in a serverless-friendly way (e.g., PDFKit or external API) due to Worker runtime limits.
- **Dependencies:** Minimal external NPM packages.

**Assumptions:**
- Users will provide their own API Keys for AI features if we don't centralize it (or we manage a centralized quota).
- The Job Description provided by the user is text-based (copy-paste).

---

## Stakeholders

| Stakeholder | Role | Responsibility |
|-------------|------|----------------|
| Job Seeker | Primary User | Creates resumes, utilizes AI tools, exports documents. |
| Developer | Owner | Implements backend, maintains architecture and tests. |

---

## Risks (initial)

- **AI Hallucination:** The AI might invent skills the user doesn't have.
    - *Mitigation:* Explicit UI warning that user must review AI-generated content.
- **PDF Formatting on Edge:** Generating complex PDFs in a non-Node.js environment (Workers) is tricky.
    - *Mitigation:* Use pure JS libraries (jspdf/pdf-lib) or offload to a specific microservice if needed.
- **Cloudflare D1 Beta:** D1 limitations on transaction size.
    - *Mitigation:* Store large Resume JSON blobs carefully or split tables normalized.

---

## Milestones (target dates)

- **M1: Foundation:** Project setup, D1 configuration, Auth (Email+Google). — Target: Day 1
- **M2: Resume CRUD:** Users can save and retrieve resume data strings. — Target: Day 2
- **M3: AI Integration:** Connect LLM Adapter for "Analyze" and "Generate" endpoints. — Target: Day 3
- **M4: Export Engine:** Implement DOCX/PDF generation adapters. — Target: Day 4
- **M5: Polish:** Validations, Error handling, Templates logic. — Target: Day 5

---

## Non-Goals (what we explicitly won't do)

- We are NOT building a social network for professionals.
- We are NOT building a manual graphic design tool (like Canva); the layout is template-driven.

---

## Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-27 | 1.0 | Initial scope defined | AI Assistant |