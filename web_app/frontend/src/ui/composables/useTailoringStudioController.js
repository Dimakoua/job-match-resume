/**
 * useTailoringStudioController
 *
 * Controller composable for the Tailoring Studio view.
 * Orchestrates: Job fetching, Resume retrieval, ATS scoring, and AI generation.
 * Per technical_design.md §3.2D: "The Composable acts as the Controller."
 */
import { ref, computed } from 'vue';
import { GetJobApplicationUseCase } from '../../core/application/job_application/GetJobApplicationUseCase.js';
import { UpdateJobApplicationUseCase } from '../../core/application/job_application/UpdateJobApplicationUseCase.js';
import { GenerateFromJDUseCase } from '../../core/application/ai/GenerateFromJDUseCase.js';
import { ImproveTextUseCase } from '../../core/application/ai/ImproveTextUseCase.js';
import { CalculateAtsScoreUseCase } from '../../core/application/resume/CalculateAtsScoreUseCase.js';
import { UpdateResumeUseCase } from '../../core/application/resume/UpdateResumeUseCase.js';
import { ListResumesUseCase } from '../../core/application/resume/ListResumesUseCase.js';
import { HttpJobApplicationRepository } from '../../infrastructure/api/HttpJobApplicationRepository.js';
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js';
import { HttpAIService } from '../../infrastructure/api/HttpAIService.js';
import { useAuthStore } from '../stores/useAuthStore.js';

export function useTailoringStudioController(applicationIdRef) {
  // ===== Dependency Injection (DI) =====
  const jobApplicationRepository = new HttpJobApplicationRepository();
  const resumeRepository = new HttpResumeRepository();
  const aiService = new HttpAIService();

  const getJobApplicationUseCase = new GetJobApplicationUseCase(jobApplicationRepository);
  const updateJobApplicationUseCase = new UpdateJobApplicationUseCase(jobApplicationRepository);
  const generateFromJDUseCase = new GenerateFromJDUseCase(aiService, resumeRepository);
  const improveTextUseCase = new ImproveTextUseCase(aiService);
  const calculateAtsScoreUseCase = new CalculateAtsScoreUseCase(resumeRepository);
  const updateResumeUseCase = new UpdateResumeUseCase(resumeRepository);
  const listResumesUseCase = new ListResumesUseCase(resumeRepository);

  const authStore = useAuthStore();

  // ===== State =====
  const job = ref(null);
  const resume = ref(null);
  const atsScore = ref(null);
  const isLoadingJob = ref(false);
  const isLoadingResume = ref(false);
  const isCalculatingAts = ref(false);
  const isGenerating = ref(false);
  const error = ref(null);

  // UI State
  const activeSection = ref('editor');
  const selectedKeywords = ref([]);
  const suggestedKeywords = ref([]);
  const generationSettings = ref({
    tone: 'professional',
    targetAtsScore: 95
  });

  // Resume linking state
  const userResumes = ref([]);
  const isLoadingResumes = ref(false);
  const showLinkResumeModal = ref(false);

  // Load settings from localStorage if available
  const savedSettings = localStorage.getItem('generationSettings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      generationSettings.value = { ...generationSettings.value, ...parsed };
      // Clear the saved settings after loading
      localStorage.removeItem('generationSettings');
    } catch (error) {
      console.warn('Failed to parse saved generation settings:', error);
    }
  }

  // ===== Computed =====
  const jobKeywords = computed(() => {
    if (!job.value?.jobDescription) return [];
    // Extract keywords from job description (simple approach)
    const words = job.value.jobDescription.toLowerCase().split(/\s+/);
    const keywords = words.filter(w => w.length > 4);
    return [...new Set(keywords)].slice(0, 10);
  });

  const resumeText = computed(() => {
    if (!resume.value?.sections) return '';

    // Handle array format (AI generated resumes)
    if (Array.isArray(resume.value.sections)) {
      return resume.value.sections.map(section => section.content || '').join('\n\n');
    }

    // Handle flat Builder format (existing resumes)
    const sections = resume.value.sections;
    let text = '';

    if (sections.summary) text += sections.summary + '\n\n';
    if (sections.experience && Array.isArray(sections.experience)) {
      text += sections.experience.map(exp =>
        `${exp.title} at ${exp.company}\n${exp.description || ''}`
      ).join('\n\n') + '\n\n';
    }
    if (sections.education && Array.isArray(sections.education)) {
      text += sections.education.map(edu =>
        `${edu.degree} in ${edu.field} from ${edu.school}`
      ).join('\n\n') + '\n\n';
    }
    if (sections.skills && Array.isArray(sections.skills)) {
      text += 'Skills: ' + sections.skills.join(', ') + '\n\n';
    }
    if (sections.certifications && Array.isArray(sections.certifications)) {
      text += sections.certifications.map(cert =>
        `${cert.name} from ${cert.issuer}`
      ).join('\n\n') + '\n\n';
    }
    if (sections.projects && Array.isArray(sections.projects)) {
      text += sections.projects.map(proj =>
        `${proj.name}: ${proj.description}`
      ).join('\n\n') + '\n\n';
    }

    return text.trim();
  });

  const atsScorePercent = computed(() => {
    if (!atsScore.value) return null;
    return Math.min(Math.round(atsScore.value * 100), 100);
  });

  const displaySections = computed(() => {
    if (!resume.value?.sections) return [];

    // If already in array format (AI generated), return as is
    if (Array.isArray(resume.value.sections)) {
      return resume.value.sections;
    }

    // Transform flat Builder format to array format for display
    const sections = resume.value.sections;
    const result = [];

    // Personal Info
    if (sections.firstName || sections.lastName || sections.email || sections.phone || sections.location) {
      result.push({
        title: 'Personal Information',
        content: [
          sections.firstName && sections.lastName ? `${sections.firstName} ${sections.lastName}` : '',
          sections.title || '',
          sections.email || '',
          sections.phone || '',
          sections.location || '',
          sections.linkedin || ''
        ].filter(Boolean).join('\n')
      });
    }

    // Summary
    if (sections.summary) {
      result.push({
        title: 'Professional Summary',
        content: sections.summary
      });
    }

    // Experience
    if (sections.experience && Array.isArray(sections.experience) && sections.experience.length > 0) {
      result.push({
        title: 'Work Experience',
        content: sections.experience.map(exp =>
          `${exp.title} at ${exp.company}\n${exp.location ? exp.location + '\n' : ''}${exp.startDate} - ${exp.endDate}\n${exp.description || ''}`
        ).join('\n\n')
      });
    }

    // Education
    if (sections.education && Array.isArray(sections.education) && sections.education.length > 0) {
      result.push({
        title: 'Education',
        content: sections.education.map(edu =>
          `${edu.degree} in ${edu.field}\n${edu.school}${edu.location ? ', ' + edu.location : ''}\n${edu.startDate} - ${edu.endDate}${edu.gpa ? '\nGPA: ' + edu.gpa : ''}`
        ).join('\n\n')
      });
    }

    // Skills
    if (sections.skills && Array.isArray(sections.skills) && sections.skills.length > 0) {
      result.push({
        title: 'Skills',
        content: sections.skills.join(', ')
      });
    }

    // Certifications
    if (sections.certifications && Array.isArray(sections.certifications) && sections.certifications.length > 0) {
      result.push({
        title: 'Certifications',
        content: sections.certifications.map(cert =>
          `${cert.name} from ${cert.issuer}${cert.date ? ' (' + cert.date + ')' : ''}${cert.link ? '\n' + cert.link : ''}`
        ).join('\n\n')
      });
    }

    // Projects
    if (sections.projects && Array.isArray(sections.projects) && sections.projects.length > 0) {
      result.push({
        title: 'Projects',
        content: sections.projects.map(proj =>
          `${proj.name}${proj.link ? ' (' + proj.link + ')' : ''}\n${proj.description || ''}`
        ).join('\n\n')
      });
    }

    return result;
  });

  // ===== Methods =====
  const loadApplication = async () => {
    if (!applicationIdRef?.value) return;

    isLoadingJob.value = true;
    error.value = null;

    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      job.value = await getJobApplicationUseCase.execute({
        applicationId: applicationIdRef.value,
        userId
      });

      // Load associated resume if linked
      if (job.value.resumeId) {
        await loadResume();
      }

      // Calculate ATS score if we have both resume and job description
      if (job.value.resumeId && job.value.jobDescription) {
        await calculateAts();
      }
    } catch (err) {
      error.value = 'Failed to load job application. Please try again.';
      console.error('Error loading application:', err);
    } finally {
      isLoadingJob.value = false;
    }
  };

  const loadResume = async () => {
    if (!job.value?.resumeId) return;

    isLoadingResume.value = true;
    error.value = null;

    try {
      resume.value = await resumeRepository.get(job.value.resumeId);
    } catch (err) {
      error.value = 'Failed to load resume. Please try again.';
      console.error('Error loading resume:', err);
    } finally {
      isLoadingResume.value = false;
    }
  };

  const calculateAts = async () => {
    if (!job.value?.jobDescription || !resume.value) return;

    isCalculatingAts.value = true;
    error.value = null;

    try {
      const result = await calculateAtsScoreUseCase.execute({
        resumeText: resumeText.value,
        jobDescription: job.value.jobDescription
      });
      atsScore.value = result.score || 0;

      // Extract suggested keywords
      if (result.keywords) {
        suggestedKeywords.value = result.keywords;
      }
    } catch (err) {
      console.error('Error calculating ATS score:', err);
      atsScore.value = null;
    } finally {
      isCalculatingAts.value = false;
    }
  };

  const generateTailoredResume = async (settings = null) => {
    if (!job.value?.jobDescription) {
      throw new Error('No job description available');
    }

    isGenerating.value = true;
    error.value = null;

    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Use provided settings or fall back to current state
      const genSettings = settings || generationSettings.value;

      // Generate tailored resume from job description
      const tailoredResume = await generateFromJDUseCase.execute(
        job.value.jobDescription,
        { userId },
        resume.value?.templateId || 'professional',
        genSettings
      );

      resume.value = tailoredResume;

      // Recalculate ATS score
      await calculateAts();

      return tailoredResume;
    } catch (err) {
      error.value = 'Failed to generate tailored resume. Please try again.';
      console.error('Error generating resume:', err);
      throw err;
    } finally {
      isGenerating.value = false;
    }
  };

  const improveSection = async (text) => {
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided to improve');
    }

    try {
      const improved = await improveTextUseCase.execute(text);
      return improved;
    } catch (err) {
      console.error('Error improving text:', err);
      throw err;
    }
  };

  const updateResume = async (updatedResume) => {
    error.value = null;

    try {
      const saved = await updateResumeUseCase.execute({ resume: updatedResume });
      resume.value = saved;

      // Recalculate ATS score
      await calculateAts();

      return saved;
    } catch (err) {
      error.value = 'Failed to save resume changes. Please try again.';
      console.error('Error updating resume:', err);
      throw err;
    }
  };

  const switchSection = (section) => {
    activeSection.value = section;
  };

  const toggleKeywordSelection = (keyword) => {
    const index = selectedKeywords.value.indexOf(keyword);
    if (index > -1) {
      selectedKeywords.value.splice(index, 1);
    } else {
      selectedKeywords.value.push(keyword);
    }
  };

  const loadUserResumes = async () => {
    isLoadingResumes.value = true;
    error.value = null;

    try {
      userResumes.value = await listResumesUseCase.execute();
    } catch (err) {
      error.value = 'Failed to load resumes. Please try again.';
      console.error('Error loading user resumes:', err);
    } finally {
      isLoadingResumes.value = false;
    }
  };

  const linkResumeToApplication = async (resumeId) => {
    if (!job.value) {
      throw new Error('No job application loaded');
    }

    error.value = null;

    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Update the job application with the linked resume
      const updatedApplication = { ...job.value, resumeId };
      const savedApplication = await updateJobApplicationUseCase.execute({
        application: updatedApplication
      });

      job.value = savedApplication;

      // Load the linked resume
      await loadResume();

      // Calculate ATS score
      if (job.value.jobDescription) {
        await calculateAts();
      }

      return savedApplication;
    } catch (err) {
      error.value = 'Failed to link resume. Please try again.';
      console.error('Error linking resume:', err);
      throw err;
    }
  };

  return {
    // State
    job,
    resume,
    atsScore,
    isLoadingJob,
    isLoadingResume,
    isCalculatingAts,
    isGenerating,
    error,
    activeSection,
    selectedKeywords,
    suggestedKeywords,
    generationSettings,
    userResumes,
    isLoadingResumes,
    showLinkResumeModal,

    // Computed
    jobKeywords,
    resumeText,
    atsScorePercent,
    displaySections,

    // Methods
    loadApplication,
    loadResume,
    calculateAts,
    generateTailoredResume,
    improveSection,
    updateResume,
    switchSection,
    toggleKeywordSelection,
    loadUserResumes,
    linkResumeToApplication
  };
}
