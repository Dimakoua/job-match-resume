/**
 * Dependency Injection Container
 */

import { SignUpUserService } from './application/sign_up_user/sign_up_user_service.js';
import { LoginUserService } from './application/login_user/login_user_service.js';
import { GetUserProfileService } from './application/get_user_profile/get_user_profile_service.js';
import { UpdateUserService } from './application/update_user/update_user_service.js';
import { CreateResumeService } from './application/resume/create_resume_service.js';
import { ListResumesService } from './application/resume/list_resumes_service.js';
import { GetResumeService } from './application/resume/get_resume_service.js';
import { DeleteResumeService } from './application/resume/delete_resume_service.js';
import { UpdateResumeService } from './application/update_resume/update_resume_service.js';
import { ListTemplatesService } from './application/list_templates/list_templates_service.js';
import { GenerateFromJDService } from './application/generate_from_jd/generate_from_jd_service.js';
import { ImproveTextService } from './application/improve_text/improve_text_service.js';
import { GenerateSuggestionsService } from './application/generate_suggestions/generate_suggestions_service.js';
import { ParseResumeTextService } from './application/parse_resume_text/parse_resume_text_service.js';
import { ExportResumeService } from './application/export_resume/export_resume_service.js';
import { CalculateAtsScoreService } from './application/calculate_ats_score/calculate_ats_score_service.js';
import { CreateJobSearchListService } from './application/job_search_list/create_job_search_list_service.js';
import { ListJobSearchListsService } from './application/job_search_list/list_job_search_lists_service.js';
import { UpdateJobSearchListService } from './application/job_search_list/update_job_search_list_service.js';
import { DeleteJobSearchListService } from './application/job_search_list/delete_job_search_list_service.js';
import { CreateJobApplicationFromExtensionService } from './application/job_application/create_job_application_from_extension_service.js';
import { ListJobApplicationsService } from './application/job_application/list_job_applications_service.js';
import { UpdateJobApplicationService } from './application/job_application/update_job_application_service.js';
import { DeleteJobApplicationService } from './application/job_application/delete_job_application_service.js';
import { ArchiveJobApplicationService } from './application/job_application/archive_job_application_service.js';
import { UnarchiveJobApplicationService } from './application/job_application/unarchive_job_application_service.js';
import { D1UserRepository } from './adapters/repositories/user/d1_user_repository.js';
import { D1ResumeRepository } from './adapters/repositories/resume/d1_resume_repository.js';
import { D1JobSearchListRepository } from './adapters/repositories/job_search_list/d1_job_search_list_repository.js';
import { D1JobApplicationRepository } from './adapters/repositories/job_application/d1_job_application_repository.js';
import { UserRepository } from './domain/user/user_repository.js';
import { ResumeRepository } from './domain/resume/resume_repository.js';
import { JobSearchListRepository } from './domain/job_search_list/job_search_list_repository.js';
import { JobApplicationRepository } from './domain/job_application/job_application_repository.js';
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
  // Validate required environment variables
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file or wrangler.toml');
  }

  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file or wrangler.toml');
  }

  // Validate that secrets are not placeholder values
  if (env.JWT_SECRET === 'your-development-jwt-secret' || env.JWT_SECRET === 'your-production-jwt-secret' || env.JWT_SECRET === 'dev-secret-key-change-in-production') {
    throw new Error('JWT_SECRET is set to a placeholder value. Please set a real secret key.');
  }

  if (env.GEMINI_API_KEY === 'your-development-gemini-api-key' || env.GEMINI_API_KEY === 'your-production-gemini-api-key') {
    throw new Error('GEMINI_API_KEY is set to a placeholder value. Please set a real Gemini API key from Google AI Studio.');
  }

  // Validate JWT secret strength (minimum 32 characters for security)
  if (env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security.');
  }

  const jwt_secret = env.JWT_SECRET;
  const geminiApiKey = env.GEMINI_API_KEY;
  const userRepositoryImplementation = new D1UserRepository(env.DB);
  const userRepository = new UserRepository(userRepositoryImplementation);

  const resumeRepositoryImplementation = new D1ResumeRepository(env.DB);
  const resumeRepository = new ResumeRepository(resumeRepositoryImplementation);

  const jobSearchListRepositoryImplementation = new D1JobSearchListRepository(env.DB);
  const jobSearchListRepository = new JobSearchListRepository(jobSearchListRepositoryImplementation);

  const jobApplicationRepositoryImplementation = new D1JobApplicationRepository(env.DB);
  const jobApplicationRepository = new JobApplicationRepository(jobApplicationRepositoryImplementation);

  const templateRepository = new TemplateRepository();

  const aiAdapter = new GeminiAdapter(geminiApiKey);

  const pdfAdapter = new PdfAdapter();
  const docxAdapter = new DocxAdapter();

  const signUpService = new SignUpUserService(userRepository);
  const loginService = new LoginUserService(userRepository, jwt_secret);
  const getUserProfileService = new GetUserProfileService(userRepository);
  const updateUserService = new UpdateUserService(userRepository);
  const createResumeService = new CreateResumeService(resumeRepository, templateRepository);
  const listResumesService = new ListResumesService(resumeRepository);
  const getResumeService = new GetResumeService(resumeRepository);
  const deleteResumeService = new DeleteResumeService(resumeRepository);
  const updateResumeService = new UpdateResumeService(resumeRepository, templateRepository);
  const listTemplatesService = new ListTemplatesService(templateRepository);
  const generateFromJDService = new GenerateFromJDService(aiAdapter, resumeRepository, templateRepository);
  const improveTextService = new ImproveTextService(aiAdapter);
  const generateSuggestionsService = new GenerateSuggestionsService(aiAdapter);
  const parseResumeTextService = new ParseResumeTextService(aiAdapter);
  const exportResumeService = new ExportResumeService(resumeRepository, pdfAdapter, docxAdapter);
  const calculateAtsScoreService = new CalculateAtsScoreService();
  const createJobSearchListService = new CreateJobSearchListService(jobSearchListRepository);
  const listJobSearchListsService = new ListJobSearchListsService(jobSearchListRepository, jobApplicationRepository);
  const updateJobSearchListService = new UpdateJobSearchListService(jobSearchListRepository);
  const deleteJobSearchListService = new DeleteJobSearchListService(jobSearchListRepository);
  const createJobApplicationFromExtensionService = new CreateJobApplicationFromExtensionService(
    jobApplicationRepository, 
    userRepository,
    jobSearchListRepository,
    createJobSearchListService
  );
  const listJobApplicationsService = new ListJobApplicationsService(jobApplicationRepository);
  const updateJobApplicationService = new UpdateJobApplicationService(jobApplicationRepository);
  const deleteJobApplicationService = new DeleteJobApplicationService(jobApplicationRepository);
  const archiveJobApplicationService = new ArchiveJobApplicationService(jobApplicationRepository);
  const unarchiveJobApplicationService = new UnarchiveJobApplicationService(jobApplicationRepository);

  return {
    userRepository,
    resumeRepository,
    jobSearchListRepository,
    jobApplicationRepository,
    templateRepository,
    aiAdapter,
    pdfAdapter,
    docxAdapter,
    signUpService,
    loginService,
    getUserProfileService,
    updateUserService,
    createResumeService,
    listResumesService,
    getResumeService,
    deleteResumeService,
    updateResumeService,
    listTemplatesService,
    generateFromJDService,
    improveTextService,
    generateSuggestionsService,
    parseResumeTextService,
    exportResumeService,
    calculateAtsScoreService,
    createJobSearchListService,
    listJobSearchListsService,
    updateJobSearchListService,
    deleteJobSearchListService,
    createJobApplicationFromExtensionService,
    listJobApplicationsService,
    updateJobApplicationService,
    deleteJobApplicationService,
    archiveJobApplicationService,
    unarchiveJobApplicationService
  };
}