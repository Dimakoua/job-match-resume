# AI-Assisted Implementation Methodology (SSOT)
**Version:** 1.2
**Last updated:** 2026-01-21
**Status:** Single Source of Truth (SSOT). If any other doc conflicts with this, this file wins.

## 1. Purpose
Establish a deterministic, document-driven way to run multi-session, AI-assisted development with preserved context, explicit gates, and reproducible outputs, specifically handling split contexts (Frontend/Backend).

## 2. Principles
1) **Document-driven**: scope → design (or technical/ui design) → tracker → handoff.
2) **Continuity first**: every session ends with a canonical `handoff.md` in the active directory.
3) **Small slices**: ship in ≤1-day steps with measurable acceptance criteria.
4) **Gated quality**: code is “done” only when it passes all gates in §6–§10.
5) **Traceability**: each change maps to a tracker item and design section.
6) **Security by habit**: secrets hygiene is mandatory (see §8).

## 3. Session workflow (high level)
1) **Select Focus Area**: Determine if working on **Backend** or **Frontend**.
2) **Load Context**: Read the specific documentation chain for that folder (e.g., `backend/scope.md`, `frontend/ui_design.md`).
3) **Produce Opening Brief**: Use the template in §12, explicitly stating the Focus Area.
4) **Plan**: Define a ≤1-day slice tied to acceptance criteria.
5) **Implement**: Provide diffs/full files ready to paste.
6) **Validate**: Provide exact commands + expected results.
7) **Close**: Produce a **Closing Report** (§12) and update the relevant `handoff.md` (§4 schema).

## 4. Handoff schema (canonical)
Every session must leave a `handoff.md` (in `backend/` or `frontend/`) with exactly these sections:
- **Context Snapshot** – 3–7 bullets of current state.
- **Active Task(s)** – ID + title + acceptance criteria.
- **Decisions Made** – brief item + link to design/PR.
- **Changes Since Last Session** – file path, ±LOC, one-line rationale.
- **Validation & Evidence** – tests/coverage/benchmarks + where to find logs.
- **Risks & Unknowns** – each with owner and review date.
- **Next Steps** – 1–3 steps, each ≤1 day.
- **Status Summary** – glyph (⚪/🔵/✅/⚠️) + % complete.

> Use the exact headings above. No custom sections.

## 5. Tasks & acceptance
- Each tracker task must include: scope link, design link, acceptance checks, owner, status glyph, % complete, and date(s).
- Acceptance checks are **objective** (e.g., “unit coverage on changed lines ≥80% and all green CI”).

## 6. Definition of Done (DoD)
A change is **Done** only if all are true:
- Implements the design section referenced by the task.
- Lints clean; unit tests pass; integration/e2e (if in scope) pass.
- Coverage target on changed lines met (default 80% unless project overrides).
- Security scans clean (secrets/SCA) or documented exception with owner/date.
- Relevant `tracker.md` updated (status, %, evidence links).
- Relevant `handoff.md` updated using §4 schema.
- PR checklist in §10 completed.

## 7. Testing & quality
- **Unit** for every function with nontrivial logic.
- **Integration** where interfaces meet.
- **Changed-lines coverage** ≥80% (adjust by project policy).
- **Benchmarks** only where perf is a requirement; record method + dataset.
- **Determinism**: tests must be seed-stable or record seeds in `handoff.md`.

## 8. Security & secrets
- Never commit secrets; keep `.env` local; maintain `.env.example` redacted.
- Run local secret/SCA scans before pushing.
- If a secret leaks: rotate immediately, scrub history if required, record incident in `handoff.md` (Risks).

## 9. CI expectations
A standard pipeline (order may vary by stack):
1) Lint/format
2) Build
3) Unit tests (with coverage output)
4) Secret/SCA scans
5) Integration/e2e (if defined)
Failures must be copied into the session and summarized in `handoff.md`.

## 10. Branching & PRs
- Branch pattern: `feature/<slug>`; urgent fixes use `hotfix/<slug>`.
- Conventional commits recommended.
- Open a **draft PR** early; keep it small and cohesive.
- **PR checklist** (must be ticked before merge):
  - [ ] Lint/build/tests pass in CI
  - [ ] Coverage target on changed lines met
  - [ ] Secret/SCA scans clean (or approved exception)
  - [ ] `tracker.md` updated with evidence links
  - [ ] `handoff.md` updated (Closing Report is pasted in PR)

## 11. Error recovery & blockers
- When ambiguous, pick the safest default, proceed, and flag in `handoff.md`.
- When blocked, mark ⚠️ with owner/unblocker, choose a parallel task, and document in `handoff.md`.

## 12. Templates (render exactly)

### Opening Brief
```markdown
## Opening Brief
**Focus Area:** [Backend | Frontend]
**Context Summary:** [2-3 sentences synthesizing current state from handoff.md]
**Active Task:** T-### [title] — Acceptance: [measurable criteria from tracker.md]
**Plan for This Session:** [What you'll accomplish, broken into 2-4 concrete steps]
**Questions/Assumptions:** [Anything ambiguous, risky, or assumed]
**Success Looks Like:** [Specific artifacts + validation outputs expected]