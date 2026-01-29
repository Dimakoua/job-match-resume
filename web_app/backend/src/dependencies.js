/**
 * Dependency Injection Container
 */

import { SignUpUserService } from './application/sign_up_user/sign_up_user_service.js';
import { LoginUserService } from './application/login_user/login_user_service.js';
import { CreateResumeService } from './application/resume/create_resume_service.js';
import { ListResumesService } from './application/resume/list_resumes_service.js';
import { UpdateResumeService } from './application/update_resume/update_resume_service.js';
import { ListTemplatesService } from './application/list_templates/list_templates_service.js';
import { GenerateFromJDService } from './application/generate_from_jd/generate_from_jd_service.js';
import { ImproveTextService } from './application/improve_text/improve_text_service.js';
import { ExportResumeService } from './application/export_resume/export_resume_service.js';
import { D1UserRepository } from './adapters/repositories/user/d1_user_repository.js';
import { D1ResumeRepository } from './adapters/repositories/resume/d1_resume_repository.js';
import { UserRepository } from './domain/user/user_repository.js';
import { ResumeRepository } from './domain/resume/resume_repository.js';
import { TemplateRepository } from './domain/template/template_repository.js';
import { GeminiAdapter } from './adapters/ai/gemini_adapter.js';
import { PdfAdapter } from './adapters/pdf/pdf_adapter.js';
import { DocxAdapter } from './adapters/docx/docx_adapter.js';

/**
 * Creates and returns all application dependencies
 * @param {Object} env - Cloudflare Worker environment
 * @returns {Object} Dependencies object
 */
export function createDependencies(env) {
  if(!env.JWT_SECRET){
    throw new Error('JWT_SECRET is required');
  }

  if(!env.GEMINI_API_KEY){
    throw new Error('GEMINI_API_KEY is required');
  }

  const jwt_secret = env.JWT_SECRET;
  const geminiApiKey = env.GEMINI_API_KEY;
  const userRepositoryImplementation = new D1UserRepository(env.DB);
  const userRepository = new UserRepository(userRepositoryImplementation);

  const resumeRepositoryImplementation = new D1ResumeRepository(env.DB);
  const resumeRepository = new ResumeRepository(resumeRepositoryImplementation);

  const templateRepository = new TemplateRepository();

  const aiAdapter = new GeminiAdapter(geminiApiKey);

  const pdfAdapter = new PdfAdapter();
  const docxAdapter = new DocxAdapter();

  const signUpService = new SignUpUserService(userRepository);
  const loginService = new LoginUserService(userRepository, jwt_secret);
  const createResumeService = new CreateResumeService(resumeRepository, templateRepository);
  const listResumesService = new ListResumesService(resumeRepository);
  const updateResumeService = new UpdateResumeService(resumeRepository, templateRepository);
  const listTemplatesService = new ListTemplatesService(templateRepository);
  const generateFromJDService = new GenerateFromJDService(aiAdapter, resumeRepository, templateRepository);
  const improveTextService = new ImproveTextService(aiAdapter);
  const exportResumeService = new ExportResumeService(resumeRepository, pdfAdapter, docxAdapter);

  return {
    userRepository,
    resumeRepository,
    templateRepository,
    aiAdapter,
    pdfAdapter,
    docxAdapter,
    signUpService,
    loginService,
    createResumeService,
    listResumesService,
    updateResumeService,
    listTemplatesService,
    generateFromJDService,
    improveTextService,
    exportResumeService
  };
}