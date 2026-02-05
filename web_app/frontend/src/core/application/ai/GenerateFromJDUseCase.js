import { Resume } from '../../domain/resume/Resume.js'

export class GenerateFromJDUseCase {
  // Dependencies are passed in (Dependency Injection)
  constructor(aiService, resumeRepo) {
    this.aiService = aiService;
    this.resumeRepo = resumeRepo;
  }

  async execute(jobDescription, userData, templateId = null, generationSettings = null) {
    // 1. Call AI Service
    const data = await this.aiService.generateFromJD(jobDescription, userData, templateId, generationSettings);
    
    // 2. Create Domain Entity
    const resume = new Resume(data.id, data.title, data.templateId, data.sections);
    resume.validate();
    
    // 3. Return (already saved by backend)
    return resume;
  }
}