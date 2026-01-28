
**Version:** 1.0
**Last updated:** 2026-01-27
**Status:** Living document — updated as architecture evolves
**Authority:** Technical decisions source of truth; must align with `scope.md`

---

## Purpose

This document defines the technical architecture, design patterns, and implementation guidelines for the Resume Builder Backend. It answers "how are we building this?" and serves as the reference for all code decisions during implementation and PR reviews.

---

## 1. Architecture Overview

### 1.1 System Context

- **Primary Purpose:** REST API service handling resume data persistence, AI generation, and document export.
- **Integrates with:** Cloudflare D1 (Database), Cloudflare Workers (Runtime), Cloudflare Queue,  AI Provider (e.g., OpenAI\Gemini).
- **Serves:** Resume Builder UI (Frontend).

### 1.2 High-Level Architecture

**Architecture style:** Layered Architecture (Domain-Centric / Clean Architecture).

**Diagram:**
```
┌──────────────┐
│  HTTP Client │
└──────┬───────┘
       │ (JSON/HTTP)
┌──────▼───────────────────────────────────────────────────┐
│  Adapters Layer                                          │
│  ┌───────────────┐  ┌─────────────────────────────────┐  │
│  │ Controllers   │  │ Presenters / Repositories / AI  │  │
│  └───────┬───────┘  └─────────────▲───────────────────┘  │
└──────────┼────────────────────────┼──────────────────────┘
           │                        │
┌──────────▼────────────────────────┴──────────────────────┐
│  Application Layer (Orchestrators)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Services (e.g., CreateResume, AnalyzeContent)      │  │
│  └───────────────────────┬────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│  Domain Layer (Core Business Logic)                      │
│  ┌──────────┐   ┌───────────┐   ┌────────────┐           │
│  │ Entities │   │ Value Objs│   │ Interfaces │           │
│  └──────────┘   └───────────┘   └────────────┘           │
└──────────────────────────────────────────────────────────┘
```

**Component responsibilities:**

- **Adapters:**
  - Controllers: Handle HTTP requests (e.g., POST /resume/generate).
  - Repositories: Implement D1 SQL logic.
- AI Adapter: Communicates with external LLMs (Google Gemini/OpenAI/Anthropic).
  - Document Adapter: Handles PDF/DOCX/etc binary generation.
- **Application:** Orchestrates use cases (e.g., "Take user input, call AI adapter, create Domain Entity, save to Repo").
- **Domain:** Pure JavaScript classes containing business logic (e.g., Resume completeness checks, formatting rules).

### 1.3 Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Runtime | Cloudflare Workers | V8 (Workerd) | Serverless, low latency, free tier. |
| Framework | Hono | 3.x+ | Lightweight routing for Workers. |
| Database | Cloudflare D1 | Beta/Ga | Native SQL database for Workers. |
| Testing | Vitest | Latest | Fast unit testing. |
| AI/LLM | Google Gemini / OpenAI / Anthropic | API | For content analysis and generation. |
| PDF/Doc | pdf-lib / docx | npm | Pure JS libs compatible with Edge. |

**Constraints:**

✅ Must use Cloudflare native tools (Wrangler, D1).  
❌ Avoid heavy frameworks like NestJS or Express.  
❌ Avoid Puppeteer/Headless Chrome (too heavy for standard Workers).

## 2. Design Principles

### 2.1 Core Principles

#### 2.1.1 Dependency Rule

**What it means:** Dependencies point inwards.

**How we apply it:**

- Domain has NO dependencies.
- Application depends ONLY on Domain.
- Adapters depend on Application and Domain.

#### 2.1.2 Separation of Concerns

**Example:** The Resume entity knows how to validate a date range. The GenerateResumeService knows how to ask AI for data. The ResumeController knows how to read JSON from an HTTP request.

#### 2.1.3 Testability

**Strategy:** All external dependencies (Database, AI API, PDF Engine) are hidden behind Interfaces in the Domain/Application layer. We inject mocks during testing.

### 2.2 Error Handling Strategy

**Error types:**

- Operational: AI Service down, DB locked → Strategy: Log & Return 500.
- Programmer/Domain: Invalid date range, Missing template ID → Strategy: Return 400/422.

**Error response format:**

```json
{
  "error": {
    "code": "INVALID_TEMPLATE",
    "message": "The selected template ID does not exist."
  }
}
```

### 2.3 Logging Strategy

**Log levels:**

- ERROR: Crashes, AI API failures.
- WARN: Auth failures, Validation errors.
- INFO: "Resume Created: ID 123", "Export Generated".
- DEBUG: Payload to AI (dev only).

**Security:** ❌ NEVER log PII (User details) or AI API Keys.

## 3. Module Design

### 3.1 Directory Structure

```
src/
├── domain/                  # PURE JS, No Frameworks
│   ├── user/
│   ├── resume/
│   │   ├── resume.js
│   │   ├── resume_section.js
│   │   ├── resume_repository.js  (Interface)
│   │   └── ai_service.js         (Interface)
│   └── template/
├── application/             # Coordinators
│   ├── auth/
│   ├── manage_resume/
│   │   ├── create_resume_service.js
│   │   └── update_resume_service.js
│   ├── ai_generation/
│   │   ├── analyze_resume_service.js
│   │   └── generate_from_jd_service.js
│   └── export/
│       └── export_resume_service.js
├── adapters/                # Infrastructure
│   ├── controllers/
│   │   ├── base_controller.js
│   │   ├── resume_controller.js
│   │   └── ai_controller.js
│   ├── infrastructure/      # External Integrations
│   │   ├── gemini_adapter.js
│   │   └── pdf_generator_adapter.js
│   ├── repositories/        # D1 Implementations
|   |   ├──user
│   |       ├── d1_user_repository.js
│   |       └── d1_resume_repository.js
|   ├── router
|       ├── auth_routes.js
|       ├── resume_routes.js
└── router.js                 # Entry point / Router
└── dependencies.js           # Dependency injection container
```

### 3.2 Layer Responsibilities

#### Domain Layer

**Purpose:** Core business rules.

**Code pattern:**

```javascript
// resume.js
export class Resume {
  constructor(id, userId, title, sections) {
    if (!title) throw new Error("Resume must have a title");
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.sections = sections || []; 
  }

  addSection(section) {
    // Logic: Ensure no duplicate section types if restricted
    this.sections.push(section);
  }
}
```

#### Application Layer

**Purpose:** Orchestrate user stories.

**Code pattern:**

```javascript
// generate_from_jd_service.js
export class GenerateFromJDService {
  constructor(aiService, resumeRepository) {
    this.aiService = aiService;
    this.resumeRepository = resumeRepository;
  }
  async execute(userId, jobDescription) {
    const content = await this.aiService.generateResumeContent(jobDescription);
    const resume = new Resume(uuid(), userId, "AI Generated Resume", content);
    await this.resumeRepository.save(resume);
    return resume;
  }
}
```

#### Adapters Layer (AI)

**Purpose:** Talk to external tools.

**Code pattern:**

```javascript
// gemini_adapter.js
export class GeminiAdapter {
  constructor(apiKey) { this.apiKey = apiKey; }
  
  async generateJSON(systemPrompt, userPrompt) {
    // Call Gemini API...
    // Map response to Domain Object structure
    return mappedSections;
  }
}
```

#### Controllers

**Purpose:** Handle HTTP requests and responses, providing reusable authentication and response utilities.

**BaseController:** Contains common logic for JWT verification, authentication, and response formatting.

**Code pattern:**

```javascript
// base_controller.js
import jwt from '@tsndr/cloudflare-worker-jwt';

export class BaseController {
  constructor(jwtSecret = null) {
    this.jwtSecret = jwtSecret;
  }

  /**
   * Verifies JWT token and returns payload
   * @param {string} token - JWT token
   * @param {string} secret - JWT secret
   * @returns {Promise<object|null>} Decoded payload or null if invalid
   */
  async verifyToken(token, secret) {
    try {
      const isValid = await jwt.verify(token, secret);
      if (!isValid) return null;
      const decoded = jwt.decode(token);
      return decoded.payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Authenticates request and returns user ID from JWT
   * @param {Request} request - The HTTP request
   * @returns {Promise<string>} User ID from JWT
   * @throws {Response} 401 error response if authentication fails
   */
  async authenticate(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw this.errorResponse('Unauthorized', 'Authentication required', 401);
    }

    const token = authHeader.slice(7); // Remove 'Bearer '
    const payload = await this.verifyToken(token, this.jwtSecret);
    if (!payload) {
      throw this.errorResponse('Unauthorized', 'Invalid token', 401);
    }
    return payload.userId;
  }

  /**
   * Creates a JSON response with proper headers
   * @param {any} data - The data to serialize as JSON
   * @param {number} status - HTTP status code (default: 200)
   * @returns {Response}
   */
  jsonResponse(data, status = 200) {
    return new Response(
      JSON.stringify(data),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Creates a success response
   * @param {any} data - The success data
   * @param {number} status - HTTP status code (default: 200)
   * @returns {Response}
   */
  successResponse(data, status = 200) {
    return this.jsonResponse(data, status);
  }

  /**
   * Creates an error response
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {number} status - HTTP status code (default: 500)
   * @param {any} details - Optional error details
   * @returns {Response}
   */
  errorResponse(code, message, status = 500, details = null) {
    const error = { code, message };
    if (details) {
      error.details = details;
    }
    return this.jsonResponse({ error }, status);
  }

  /**
   * Creates a validation error response
   * @param {Array} issues - Zod validation issues
   * @returns {Response}
   */
  validationErrorResponse(issues) {
    return this.errorResponse('VALIDATION_ERROR', 'Invalid request data', 400, issues);
  }
}

// auth_controller.js
export class AuthController extends BaseController {
  constructor(deps, jwtSecret) {
    super(jwtSecret);
    this.signUpUserService = deps.signUpService;
    this.loginUserService = deps.loginService;
  }

  // Controller methods here
}
```

### 3.3 Testing Strategy

**Unit Tests (*.test.js):** Focus on Domain logic (validations) and Application flow (services). Mock the AI calls, for DB please use real test env database to test integration and query.

**Integration Tests:** Test D1 repositories using wrangler local environment.

**Coverage Target:** >90% for Domain/Application.

## 4. Security Guidelines

### 4.1 Authentication

**Providers:**

- Email/Password: Custom implementation using bcrypt.
- Google OAuth: Verify Google ID Token on backend.

**Session:** Stateless JWT (HS256) in Authorization header.

### 4.2 Data Protection

**Secrets:** API Keys (Gemini, Google Client Secret) stored in wrangler secret.

**Sanitization:** All user inputs (especially for the Resume) must be sanitized before being rendered into HTML/PDF to prevent XSS (even in PDF generation).

## 5. Performance Guidelines

### 5.1 Database

**Resume Data:** Stored as JSON strings in D1 if structure is highly variable, or normalized tables (Experience, Education) if structure is strict.

**Decision:** Hybrid. Core metadata in columns, content sections in a JSON column for flexibility.

### 5.2 AI Optimization

**Streaming:** If possible, stream AI text response to frontend to reduce perceived latency (requires WebSocket or ReadableStream).

**Caching:** Cache generated results? No, typically unique per JD.

## 6. Deployment & Operations

### 6.1 Environment Strategy

| Environment | Purpose | Deploy Trigger | Data |
|-------------|---------|----------------|------|
| Local | Dev/Test | Manual | SQLite (Miniflare) |
| Production | Live App | Merge to Main | D1 Production |

### 6.2 Database Migrations

**Tool:** Wrangler D1 Migrations.

**Location:** /migrations.

**Command:** wrangler d1 migrations apply.

## 7. Decision Log (ADRs)

### 7.1 ADR-001: PDF Generation in Worker

**Context:** Users need PDF export. Workers cannot run Headless Chrome (Puppeteer).

**Decision:** Use jspdf or pdf-lib (Pure JS) to construct PDFs programmatically.

**Consequences:** Layout logic is harder to write (coordinate based) vs HTML-to-PDF, but it runs natively on Edge with zero cost.

### 7.2 ADR-002: AI Interface

**Context:** We might switch from Gemini to OpenAI or Anthropic or Llama.

**Decision:** Create a generic AIService interface in Domain layer.

**Consequences:** Easy to swap providers without changing business logic.

## 8. Extensibility

### 8.1 Future Work

- Resume Score: Add a numeric scoring module (Application Layer service).
- Public Links: Add a module to share a resume via a public unique URL.

## 9. Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-27 | 1.0 | Initial design document | AI Assistant |