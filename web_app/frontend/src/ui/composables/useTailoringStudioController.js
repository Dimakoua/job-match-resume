/**
 * useTailoringStudioController
 *
 * Controller composable for the Tailoring Studio view.
 * Orchestrates: Job fetching, Resume retrieval, ATS scoring, and AI generation.
 * Per technical_design.md §3.2D: "The Composable acts as the Controller."
 */
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { GetJobApplicationUseCase } from '../../core/application/job_application/GetJobApplicationUseCase.js';
import { UpdateJobApplicationUseCase } from '../../core/application/job_application/UpdateJobApplicationUseCase.js';
import { GenerateFromJDUseCase } from '../../core/application/ai/GenerateFromJDUseCase.js';
import { ImproveTextUseCase } from '../../core/application/ai/ImproveTextUseCase.js';
import { GenerateSuggestionsUseCase } from '../../core/application/ai/GenerateSuggestionsUseCase.js';
import { CalculateAtsScoreUseCase } from '../../core/application/resume/CalculateAtsScoreUseCase.js';
import { UpdateResumeUseCase } from '../../core/application/resume/UpdateResumeUseCase.js';
import { ListResumesUseCase } from '../../core/application/resume/ListResumesUseCase.js';
import { HttpJobApplicationRepository } from '../../infrastructure/api/HttpJobApplicationRepository.js';
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js';
import { HttpAIService } from '../../infrastructure/api/HttpAIService.js';
import { useAuthStore } from '../stores/useAuthStore.js';

export function useTailoringStudioController() {
  const route = useRoute();
  const applicationIdRef = computed(() => route.params.id);
  // ===== Dependency Injection (DI) =====
  const jobApplicationRepository = new HttpJobApplicationRepository();
  const resumeRepository = new HttpResumeRepository();
  const aiService = new HttpAIService();

  const getJobApplicationUseCase = new GetJobApplicationUseCase(jobApplicationRepository);
  const updateJobApplicationUseCase = new UpdateJobApplicationUseCase(jobApplicationRepository);
  const generateFromJDUseCase = new GenerateFromJDUseCase(aiService, resumeRepository);
  const improveTextUseCase = new ImproveTextUseCase(aiService);
  const generateSuggestionsUseCase = new GenerateSuggestionsUseCase(aiService);
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

  // AI Suggestions state
  const suggestions = ref([]);
  const isGeneratingSuggestions = ref(false);

  // UI state for feedback
  const appliedSuggestions = ref([]);
  const lastAppliedSuggestion = ref(null);
  const showGenerationModal = ref(false);
  const selectedResumeId = ref(null);

  // Job editing state
  const isEditingJob = ref(false);
  const editedJob = ref({});

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

  // ATS Analysis Data
  const atsScorePercent = computed(() => {
    if (!atsScore.value?.score && typeof atsScore.value !== 'number') return null;
    // Support both legacy (number) and new (object) formats
    if (typeof atsScore.value === 'number') return Math.min(Math.round(atsScore.value * 100), 100);
    return Math.min(Math.round(atsScore.value.score), 100);
  });

  const atsMatchedKeywords = computed(() => {
    if (!atsScore.value) return [];
    if (typeof atsScore.value === 'number') return [];
    return atsScore.value.matchedKeywords || [];
  });

  const atsMissedKeywords = computed(() => {
    if (!atsScore.value) return [];
    if (typeof atsScore.value === 'number') return [];
    return atsScore.value.missedKeywords || [];
  });

  const atsJobKeywords = computed(() => {
    if (!atsScore.value) return [];
    if (typeof atsScore.value === 'number') return [];
    return atsScore.value.jobDescriptionKeywords || [];
  });

  // Sub-scores (mocked for now, can be replaced with backend values if available)
  const atsSkillRelevance = computed(() => {
    // Example: percent of matched keywords
    if (!atsScore.value || typeof atsScore.value === 'number') return null;
    const total = atsScore.value.jobDescriptionKeywords?.length || 0;
    const matched = atsScore.value.matchedKeywords?.length || 0;
    if (!total) return null;
    return Math.round((matched / total) * 100);
  });
  const atsFormatScore = computed(() => 78); // Placeholder
  const atsKeywordDensity = computed(() => {
    if (!atsScore.value || typeof atsScore.value === 'number') return null;
    const resumeCount = atsScore.value.resumeKeywordCount || 0;
    const jobCount = atsScore.value.jobKeywordCount || 0;
    if (!resumeCount || !jobCount) return null;
    return Math.round((resumeCount / jobCount) * 100);
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

  const generateTailoredResume = async (settings = null, selectedResumeId = null) => {
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

      let baseResume = resume.value;
      if (selectedResumeId && selectedResumeId !== resume.value?.id) {
        // Fetch the selected resume
        const resumes = await listResumesUseCase.execute(userId);
        baseResume = resumes.find(r => r.id === selectedResumeId);
      }

      // Get comprehensive user data for the base resume
      const getResumeText = (resumeObj) => {
        if (!resumeObj?.sections) return '';

        // Handle array format (AI generated resumes)
        if (Array.isArray(resumeObj.sections)) {
          return resumeObj.sections.map(section => section.content || '').join('\n\n');
        }

        // Handle flat Builder format (existing resumes)
        const sections = resumeObj.sections;
        let text = '';

        // Personal Information
        const personalInfo = [];
        if (sections.firstName || sections.lastName) {
          personalInfo.push(`Name: ${sections.firstName || ''} ${sections.lastName || ''}`.trim());
        }
        if (sections.title) personalInfo.push(`Title: ${sections.title}`);
        if (sections.email) personalInfo.push(`Email: ${sections.email}`);
        if (sections.phone) personalInfo.push(`Phone: ${sections.phone}`);
        if (sections.location) personalInfo.push(`Location: ${sections.location}`);
        if (sections.linkedin) personalInfo.push(`LinkedIn: ${sections.linkedin}`);
        if (sections.website) personalInfo.push(`Website: ${sections.website}`);

        if (personalInfo.length > 0) {
          text += 'PERSONAL INFORMATION\n' + personalInfo.join('\n') + '\n\n';
        }

        // Professional Summary
        if (sections.summary) {
          text += 'PROFESSIONAL SUMMARY\n' + sections.summary + '\n\n';
        }

        // Work Experience
        if (sections.experience && Array.isArray(sections.experience) && sections.experience.length > 0) {
          text += 'WORK EXPERIENCE\n';
          text += sections.experience.map(exp => {
            let expText = `${exp.title} at ${exp.company}`;
            if (exp.location) expText += ` (${exp.location})`;
            if (exp.startDate || exp.endDate) {
              expText += `\n${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
            }
            if (exp.description) expText += `\n${exp.description}`;
            return expText;
          }).join('\n\n') + '\n\n';
        }

        // Education
        if (sections.education && Array.isArray(sections.education) && sections.education.length > 0) {
          text += 'EDUCATION\n';
          text += sections.education.map(edu => {
            let eduText = `${edu.degree} in ${edu.field}`;
            if (edu.school) eduText += ` from ${edu.school}`;
            if (edu.location) eduText += ` (${edu.location})`;
            if (edu.startDate || edu.endDate) {
              eduText += `\n${edu.startDate || ''} - ${edu.endDate || ''}`;
            }
            if (edu.gpa) eduText += `\nGPA: ${edu.gpa}`;
            return eduText;
          }).join('\n\n') + '\n\n';
        }

        // Skills
        if (sections.skills && Array.isArray(sections.skills) && sections.skills.length > 0) {
          text += 'SKILLS\n' + sections.skills.join(', ') + '\n\n';
        }

        // Certifications
        if (sections.certifications && Array.isArray(sections.certifications) && sections.certifications.length > 0) {
          text += 'CERTIFICATIONS\n';
          text += sections.certifications.map(cert => {
            let certText = cert.name;
            if (cert.issuer) certText += ` from ${cert.issuer}`;
            if (cert.date) certText += ` (${cert.date})`;
            if (cert.link) certText += `\n${cert.link}`;
            return certText;
          }).join('\n\n') + '\n\n';
        }

        // Projects
        if (sections.projects && Array.isArray(sections.projects) && sections.projects.length > 0) {
          text += 'PROJECTS\n';
          text += sections.projects.map(proj => {
            let projText = proj.name;
            if (proj.link) projText += ` (${proj.link})`;
            if (proj.description) projText += `\n${proj.description}`;
            return projText;
          }).join('\n\n') + '\n\n';
        }

        // Custom Sections - exclude standard fields and UI/metadata
        const standardSections = [
          'firstName', 'lastName', 'title', 'email', 'phone', 'location', 'linkedin', 'website', 
          'summary', 'experience', 'education', 'skills', 'certifications', 'projects',
          // Exclude UI/metadata fields
          'visibleSections', 'visible', 'layout', 'template', 'margins', 'sectionSpacing',
          'style', 'headingFont', 'bodyFont', 'fontSize', 'lineHeight', 'accentColor',
          'theme', 'color', 'font', 'spacing', 'required'
        ];
        const customSections = Object.keys(sections).filter(key => !standardSections.includes(key) && sections[key]);

        for (const customKey of customSections) {
          const customSection = sections[customKey];
          if (customSection === null || customSection === undefined || (Array.isArray(customSection) && customSection.length === 0) || (typeof customSection === 'object' && !Array.isArray(customSection) && Object.keys(customSection).length === 0)) {
            continue; // Skip empty sections
          }

          // Format the key name as title (e.g., 'awards' -> 'AWARDS')
          const sectionTitle = customKey.replace(/([A-Z])/g, ' $1').toUpperCase().trim();
          text += `${sectionTitle}\n`;

          if (Array.isArray(customSection)) {
            // Handle array of objects
            if (customSection.length > 0 && typeof customSection[0] === 'object' && customSection[0] !== null) {
              text += customSection.map(item => {
                const entries = Object.entries(item || {})
                  .map(([k, v]) => {
                    if (v === null || v === undefined) return '';
                    if (Array.isArray(v)) return `${k}: ${v.join(', ')}`;
                    return `${k}: ${v}`;
                  })
                  .filter(Boolean);
                return entries.join('\n');
              }).join('\n\n');
              if (text.endsWith('\n')) {
                text += '\n';
              } else {
                text += '\n\n';
              }
            } else {
              // Handle simple array
              text += customSection
                .filter(v => v !== null && v !== undefined)
                .map(v => typeof v === 'object' ? JSON.stringify(v) : String(v))
                .join(', ') + '\n\n';
            }
          } else if (typeof customSection === 'object') {
            // Handle object with key-value pairs
            const entries = Object.entries(customSection || {})
              .map(([k, v]) => {
                if (v === null || v === undefined) return '';
                if (Array.isArray(v)) return `${k}: ${v.join(', ')}`;
                if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
                return `${k}: ${v}`;
              })
              .filter(Boolean);
            if (entries.length > 0) {
              text += entries.join('\n') + '\n\n';
            }
          } else {
            // Handle simple string/number/boolean value
            text += String(customSection) + '\n\n';
          }
        }

        return text.trim();
      };

      const userData = baseResume ? getResumeText(baseResume) : '';

      // Generate tailored resume from job description
      const tailoredResume = await generateFromJDUseCase.execute(
        job.value.jobDescription,
        userData,
        baseResume?.templateId || 'professional',
        genSettings
      );

      resume.value = tailoredResume;

      // Link the new resume to the application
      await updateJobApplicationUseCase.execute({
        application: { ...job.value, resumeId: tailoredResume.id }
      });

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

  const switchSection = async (section) => {
    activeSection.value = section;

    // Auto-generate suggestions when switching to suggestions tab
    if (section === 'suggestions' && suggestions.value.length === 0 && job.value?.jobDescription && resume.value && !isGeneratingSuggestions.value) {
      try {
        await generateSuggestions();
      } catch (err) {
        console.error('Failed to auto-generate suggestions:', err);
      }
    }
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

  const generateSuggestions = async () => {
    if (!job.value?.jobDescription || !resume.value) {
      throw new Error('Job description and resume are required for suggestions');
    }

    isGeneratingSuggestions.value = true;
    error.value = null;

    try {
      const suggestionsData = await generateSuggestionsUseCase.execute(
        job.value.jobDescription,
        resumeText.value
      );

      // Assuming the backend returns suggestions in the expected format
      suggestions.value = suggestionsData.map((suggestion, index) => ({
        id: `suggestion-${index}`,
        text: suggestion.text,
        type: getSuggestionTypeFromCategory(suggestion.category),
        category: suggestion.category,
        applied: false
      }));

    } catch (err) {
      error.value = 'Failed to generate suggestions. Please try again.';
      console.error('Error generating suggestions:', err);
      suggestions.value = [];
    } finally {
      isGeneratingSuggestions.value = false;
    }
  };

  const getSuggestionTypeFromCategory = (category) => {
    switch (category.toLowerCase()) {
      case 'keywords': return 'keywords';
      case 'summary': return 'summary';
      case 'experience': return 'experience';
      case 'skills': return 'skills';
      case 'education': return 'education';
      case 'quantify': return 'experience';
      case 'ats': return 'general';
      case 'impact': return 'experience';
      default: return 'general';
    }
  };

  // UI Methods
  const handleGenerateClick = async () => {
    await loadUserResumes();
    selectedResumeId.value = resume.value?.id || (userResumes.value.length > 0 ? userResumes.value[0].id : null);
    showGenerationModal.value = true;
  };

  const closeGenerationModal = () => {
    showGenerationModal.value = false;
  };

  const startGeneration = async () => {
    try {
      await generateTailoredResume(generationSettings.value, selectedResumeId.value);
      showGenerationModal.value = false;
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleLinkResumeClick = async () => {
    await loadUserResumes();
    showLinkResumeModal.value = true;
  };

  const closeLinkResumeModal = () => {
    showLinkResumeModal.value = false;
  };

  const selectResume = async (resumeId) => {
    try {
      await linkResumeToApplication(resumeId);
      showLinkResumeModal.value = false;
    } catch (err) {
      console.error('Failed to link resume:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'saved': return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400';
      case 'applied': return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
      case 'interviewing': return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // AI Suggestions Methods
  const handleGenerateSuggestions = async () => {
    try {
      await generateSuggestions();
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'keywords': return 'label';
      case 'experience': return 'work';
      case 'summary': return 'description';
      case 'education': return 'school';
      default: return 'lightbulb';
    }
  };

  const getSuggestionIconClass = (type) => {
    switch (type) {
      case 'keywords': return 'text-blue-500';
      case 'experience': return 'text-green-500';
      case 'summary': return 'text-purple-500';
      case 'education': return 'text-orange-500';
      default: return 'text-yellow-500';
    }
  };

  const getSuggestionTypeClass = (type) => {
    switch (type) {
      case 'keywords': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'experience': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'summary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'education': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSuggestionCategoryLabel = (category) => {
    switch (category) {
      case 'keywords': return 'Keywords';
      case 'summary': return 'Summary';
      case 'experience': return 'Experience';
      case 'skills': return 'Skills';
      case 'education': return 'Education';
      case 'quantify': return 'Quantify';
      case 'ats': return 'ATS';
      case 'impact': return 'Impact';
      default: return 'General';
    }
  };

  const applySuggestion = async (suggestion) => {
    if (!resume.value) {
      console.error('No resume available to apply suggestion');
      return;
    }

    try {
      // Mark suggestion as applied
      suggestion.applied = true;
      appliedSuggestions.value.push(suggestion);
      lastAppliedSuggestion.value = suggestion;

      // Parse and apply the suggestion based on category
      switch (suggestion.category.toLowerCase()) {
        case 'keywords':
          await applyKeywordSuggestion(suggestion);
          break;
        case 'skills':
          await applySkillsSuggestion(suggestion);
          break;
        case 'summary':
          await applySummarySuggestion(suggestion);
          break;
        case 'experience':
          await applyExperienceSuggestion(suggestion);
          break;
        case 'quantify':
          await applyQuantifySuggestion(suggestion);
          break;
        case 'impact':
          await applyImpactSuggestion(suggestion);
          break;
        default:
          // For other suggestions, just mark as applied and show a message
          console.log('Applied suggestion:', suggestion.text);
          break;
      }

      // Auto-clear feedback after 3 seconds
      setTimeout(() => {
        if (lastAppliedSuggestion.value === suggestion) {
          lastAppliedSuggestion.value = null;
        }
      }, 3000);

    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      suggestion.applied = false; // Reset if application failed
      appliedSuggestions.value = appliedSuggestions.value.filter(s => s.id !== suggestion.id);
    }
  };

  const applyKeywordSuggestion = async (suggestion) => {
    // Extract keywords from the suggestion text
    const keywordMatches = suggestion.text.match(/(?:add|include|incorporate|use)\s+(?:these\s+)?keywords?:?\s*([^.!?]+)|[""]([^""]+)[""]/gi);
    const keywords = [];

    if (keywordMatches) {
      keywordMatches.forEach(match => {
        const extracted = match.replace(/(?:add|include|incorporate|use)\s+(?:these\s+)?keywords?:?\s*/i, '').replace(/[""]/g, '');
        keywords.push(...extracted.split(',').map(k => k.trim()).filter(k => k.length > 0));
      });
    }

    if (keywords.length > 0) {
      // Add keywords to the skills section
      const skillsSection = resume.value.sections.skills || [];
      const newSkills = [...new Set([...skillsSection, ...keywords])]; // Remove duplicates

      await updateResume({
        id: resume.value.id,
        sections: {
          ...resume.value.sections,
          skills: newSkills
        }
      });

      console.log('Added keywords to skills:', keywords);
    }
  };

  const applySkillsSuggestion = async (suggestion) => {
    // Extract skills from the suggestion text
    const skillMatches = suggestion.text.match(/(?:add|include|highlight|emphasize)\s+(?:these\s+)?skills?:?\s*([^.!?]+)|[""]([^""]+)[""]/gi);
    const skills = [];

    if (skillMatches) {
      skillMatches.forEach(match => {
        const extracted = match.replace(/(?:add|include|highlight|emphasize)\s+(?:these\s+)?skills?:?\s*/i, '').replace(/[""]/g, '');
        skills.push(...extracted.split(',').map(s => s.trim()).filter(s => s.length > 0));
      });
    }

    if (skills.length > 0) {
      const skillsSection = resume.value.sections.skills || [];
      const newSkills = [...new Set([...skillsSection, ...skills])];

      await updateResume({
        id: resume.value.id,
        sections: {
          ...resume.value.sections,
          skills: newSkills
        }
      });

      console.log('Added skills:', skills);
    }
  };

  const applySummarySuggestion = async (suggestion) => {
    // For summary suggestions, we'll create an improved version
    // This is more complex, so for now we'll just mark it as applied
    // In a full implementation, this would use AI to generate an improved summary
    console.log('Summary improvement suggestion applied:', suggestion.text);

    // TODO: Implement AI-powered summary improvement
    // const improvedSummary = await improveSection('summary', suggestion.text);
    // await updateResume({
    //   sections: {
    //     ...resume.value.sections,
    //     summary: improvedSummary
    //   }
    // });
  };

  const applyExperienceSuggestion = async (suggestion) => {
    // For experience suggestions, mark as applied
    // Full implementation would require more sophisticated parsing
    console.log('Experience improvement suggestion applied:', suggestion.text);

    // TODO: Implement experience section improvements
    // This could involve:
    // - Adding quantifiable achievements
    // - Improving action verbs
    // - Better formatting
  };

  const applyQuantifySuggestion = async (suggestion) => {
    // For quantification suggestions, mark as applied
    console.log('Quantification suggestion applied:', suggestion.text);

    // TODO: Implement automatic quantification of achievements
    // This would analyze experience descriptions and add metrics
  };

  const applyImpactSuggestion = async (suggestion) => {
    // For impact suggestions, mark as applied
    console.log('Impact improvement suggestion applied:', suggestion.text);

    // TODO: Implement impact enhancement
    // This could involve strengthening action verbs and achievements
  };

  const dismissSuggestion = (suggestion) => {
    // Remove the suggestion from the list
    const index = suggestions.value.findIndex(s => s.id === suggestion.id);
    if (index > -1) {
      suggestions.value.splice(index, 1);
    }
  };

  const getAtsScoreTextColor = (score) => {
    if (!score || score === 0) return 'text-gray-400';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAtsScoreBgColor = (score) => {
    if (!score || score === 0) return 'bg-gray-300';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Job Editing Methods
  const startEditingJob = () => {
    if (!job.value) return;
    isEditingJob.value = true;

    // Load user resumes for the dropdown
    loadUserResumes();

    editedJob.value = {
      position: job.value.position || '',
      company: job.value.company || '',
      jobDescription: job.value.jobDescription || '',
      resumeId: job.value.resumeId || '',
      status: job.value.status || 'saved',
      appliedDate: job.value.appliedDate ? new Date(job.value.appliedDate).toISOString().split('T')[0] : '',
      notes: job.value.notes || ''
    };
  };

  const cancelEditingJob = () => {
    isEditingJob.value = false;
    editedJob.value = {};
  };

  const handleJobFormSubmit = async (formData) => {
    if (!job.value) return;

    try {
      // Prepare the updated application object
      const updatedApplication = {
        ...job.value,
        company: formData.company,
        position: formData.position,
        jobDescription: formData.jobDescription,
        resumeId: formData.resumeId || null,
        status: formData.status,
        appliedDate: formData.appliedDate ? new Date(formData.appliedDate) : null,
        notes: formData.notes || null
      };

      // Use the update use case
      const result = await updateJobApplicationUseCase.execute({
        application: updatedApplication
      });

      // Update the local job object with the response
      Object.assign(job.value, result);

      isEditingJob.value = false;
      editedJob.value = {};

      // Show success feedback (you could add a toast notification here)
      console.log('Job details updated successfully');
    } catch (error) {
      console.error('Failed to save job changes:', error);
      // Show error feedback
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

    // AI Suggestions
    suggestions,
    isGeneratingSuggestions,

    // UI state for feedback
    appliedSuggestions,
    lastAppliedSuggestion,
    showGenerationModal,
    selectedResumeId,

    // Job editing state
    isEditingJob,
    editedJob,

    // Computed
    jobKeywords,
    resumeText,
    atsScorePercent,
    displaySections,

    // ATS Analysis
    atsMatchedKeywords,
    atsMissedKeywords,
    atsJobKeywords,
    atsSkillRelevance,
    atsFormatScore,
    atsKeywordDensity,

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
    linkResumeToApplication,
    generateSuggestions,

    // UI Methods
    handleGenerateClick,
    closeGenerationModal,
    startGeneration,
    handleLinkResumeClick,
    closeLinkResumeModal,
    selectResume,
    getStatusBadgeClass,
    formatDate,
    handleGenerateSuggestions,
    getSuggestionIcon,
    getSuggestionIconClass,
    getSuggestionTypeClass,
    getSuggestionCategoryLabel,
    applySuggestion,
    dismissSuggestion,
    getAtsScoreTextColor,
    getAtsScoreBgColor,

    // Job Editing Methods
    startEditingJob,
    cancelEditingJob,
    handleJobFormSubmit
  };
}
