# technical_design.md

**Version:** 1.1
**Last updated:** 2026-01-27
**Status:** Living document — Architecture and Implementation specs
**Authority:** Code structure source of truth; must align with `scope.md`

---

## Purpose

This document defines the technical architecture for the Vue 3 Frontend. It enforces a **Clean / Domain-Centric** architecture to decouple Vue components from business logic, without the overhead of strict Interface/Port definitions.

---

## 1. Architecture Overview

### 3.1 The Concept

We separate the application into three distinct circles:

1. **Domain (Center):** Pure data structures and logic (e.g., `Resume` class).
2. **Application (Middle):** Use Cases that orchestrate actions (e.g., `GenerateResume`).
3. **Adapters (Outer):** The UI (Vue), API Clients (Axios), and Store (Pinia).

### 1.2 Technology Stack

| Layer | Technology | Role |
|-------|------------|------|
| **View** | Vue 3 (Script Setup) | Renders UI, listens to events. |
| **State** | Pinia | Global State Management (ViewModel). |
| **Logic** | JavaScript (ESM) | Pure business logic (Use Cases/Entities). |
| **Infra** | Axios | HTTP Client. |
| **Test** | Vitest | Unit testing Logic in isolation. |

---

## 2. Design Principles

### 2.1 Dependency Rule

Dependencies point **INWARD**.

- `UI` depends on `Application`.
- `Application` depends on `Domain`.
- `Infrastructure` is injected into `Application`.

### 2.2 Implicit Interfaces (Duck Typing)

Instead of creating distinct "Port" files (interfaces), we rely on contract agreement.

- If a Use Case needs a repository, we inject the `HttpResumeRepository` directly (or a mock during testing), assuming it has the required methods (`save`, `get`, etc.).

---

## 3. Module Design

### 3.1 Directory Structure

```
src/
├── core/                        # BUSINESS LOGIC (Framework Agnostic)
│   ├── domain/                  # Entities & Constants
│   │   ├── resume/
│   │   │   ├── Resume.js
│   │   │   └── Section.js
│   │   └── user/
│   │       └── User.js
│   └── application/             # Use Cases (Orchestrators)
│       ├── editor/
│       │   ├── UpdateResumeUseCase.js
│       │   └── AddSectionUseCase.js
│       ├── ai/
│       │   ├── ImproveTextUseCase.js
│       │   └── GenerateFromJDUseCase.js
│       └── export/
│           └── DownloadPdfUseCase.js
│
├── infrastructure/              # INFRASTRUCTURE (API/Storage)
│   ├── api/
│   │   ├── HttpResumeRepository.js
│   │   └── HttpAIService.js
│   └── storage/
│       └── TokenStorage.js
├── ui/                          # PRESENTATION (Vue)
│   ├── components/
│   │   ├── editor/
│   │   └── preview/
│   ├── views/
│   ├── stores/                  # Pinia
│   │   └── useResumeStore.js
│   └── composables/             # Controllers (Connects UI -> UseCase)
│       └── useEditorController.js
│
└── main.js
```

### 3.2 Code Patterns

#### A. Domain Layer (Pure JS)

```javascript
// core/domain/resume/Resume.js
export class Resume {
  constructor(id, title, sections = []) {
    this.id = id;
    this.title = title;
    this.sections = sections;
  }

  // Pure logic: No API calls here
  validate() {
    if (!this.title) throw new Error("Title is required");
  }
}
```

#### B. Application Layer (Use Cases)

The Use Case orchestrates the flow. It accepts dependencies in the constructor.

```javascript
// core/application/ai/GenerateFromJDUseCase.js
import { Resume } from '../../domain/resume/Resume';

export class GenerateFromJDUseCase {
  // Dependencies are passed in (Dependency Injection)
  constructor(aiService, resumeRepo) {
    this.aiService = aiService;
    this.resumeRepo = resumeRepo;
  }

  async execute(jobDescription) {
    // 1. Call AI Service
    const data = await this.aiService.generate(jobDescription);
    
    // 2. Create Domain Entity
    const resume = new Resume(null, "AI Draft", data.sections);
    resume.validate();
    
    // 3. Save to Backend
    return await this.resumeRepo.save(resume);
  }
}
```

#### C. Infrastructure Layer (Implementation)

The actual API calls happen here.

```javascript
// infrastructure/api/HttpAIService.js
import { axios } from '@/lib/axios';

export class HttpAIService {
  async generate(jd) {
    const response = await axios.post('/ai/generate', { jd });
    return response.data;
  }
}
```

#### D. UI Layer (Composables/Controller)

The Composable acts as the "Controller". It wires everything together.

```javascript
// ui/composables/useAIController.js
import { GenerateFromJDUseCase } from "@/core/application/ai/GenerateFromJDUseCase";
import { HttpAIService } from "@/infrastructure/api/HttpAIService";
import { HttpResumeRepository } from "@/infrastructure/api/HttpResumeRepository";
import { ref } from 'vue';

export function useAIController() {
  const isProcessing = ref(false);

  // Manual Dependency Injection
  // (In a larger app, we might use a DI container, but this is fine for now)
  const aiService = new HttpAIService();
  const repo = new HttpResumeRepository();
  const useCase = new GenerateFromJDUseCase(aiService, repo);

  const generate = async (jd) => {
    isProcessing.value = true;
    try {
      const result = await useCase.execute(jd);
      return result;
    } finally {
      isProcessing.value = false;
    }
  };

  return { generate, isProcessing };
}
```

## 4. Testing Strategy

### 4.1 Unit Tests

We test the Use Cases by passing Mock Objects instead of the real API services. Test files should be located next to the original files.

```javascript
// core/application/ai/GenerateFromJDUseCase.test.js
test('should save resume after generating', async () => {
  // Mock Dependencies
  const mockAI = { generate: async () => ({ sections: [] }) };
  const mockRepo = { save: async (r) => r };
  
  const useCase = new GenerateFromJDUseCase(mockAI, mockRepo);
  const result = await useCase.execute('Job Description');
  
  expect(result).toBeDefined();
});
```

## 5. Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-27 | 1.1 | Removed explicit Ports | AI Assistant |
| 2026-01-27 | 1.0 | Initial Spec | AI Assistant |