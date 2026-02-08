/**
 * useTailoringStudioController
 *
 * Controller composable for the Tailoring Studio view.
 * Orchestrates: Job fetching, Resume retrieval, ATS scoring, and AI generation.
 * Per technical_design.md §3.2D: "The Composable acts as the Controller."
 */
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { GetJobApplicationUseCase } from '../../core/application/job_application/GetJobApplicationUseCase.js';
import { UpdateJobApplicationUseCase } from '../../core/application/job_application/UpdateJobApplicationUseCase.js';
import { GenerateFromJDUseCase } from '../../core/application/ai/GenerateFromJDUseCase.js';
import { ImproveTextUseCase } from '../../core/application/ai/ImproveTextUseCase.js';
import { GenerateSuggestionsUseCase } from '../../core/application/ai/GenerateSuggestionsUseCase.js';
import { CalculateAtsScoreUseCase } from '../../core/application/resume/CalculateAtsScoreUseCase.js';
import { UpdateResumeUseCase } from '../../core/application/resume/UpdateResumeUseCase.js';
import { ListResumesUseCase } from '../../core/application/editor/ListResumesUseCase.js';
import { HttpJobApplicationRepository } from '../../infrastructure/api/HttpJobApplicationRepository.js';
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js';
import { HttpResumesListService } from '../../infrastructure/api/HttpResumesListService.js';
import { HttpAIService } from '../../infrastructure/api/HttpAIService.js';
import { useAuthStore } from '../stores/useAuthStore.js';

export function useTailoringStudioController() {
  const route = useRoute();
  const router = useRouter();
  const applicationIdRef = computed(() => route.params.id);
  // ===== Dependency Injection (DI) =====
  const jobApplicationRepository = new HttpJobApplicationRepository();
  const resumeRepository = new HttpResumeRepository();
  const resumesListService = new HttpResumesListService();
  const aiService = new HttpAIService();

  const getJobApplicationUseCase = new GetJobApplicationUseCase(jobApplicationRepository);
  const updateJobApplicationUseCase = new UpdateJobApplicationUseCase(jobApplicationRepository);
  const generateFromJDUseCase = new GenerateFromJDUseCase(aiService, resumeRepository);
  const improveTextUseCase = new ImproveTextUseCase(aiService);
  const generateSuggestionsUseCase = new GenerateSuggestionsUseCase(aiService);
  const calculateAtsScoreUseCase = new CalculateAtsScoreUseCase(resumeRepository);
  const updateResumeUseCase = new UpdateResumeUseCase(resumeRepository);
  const listResumesUseCase = new ListResumesUseCase(resumesListService);

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
  // Load active section from URL params or default to 'details'
  const getInitialActiveSection = () => {
    const tab = route.query.tab;
    if (tab && ['details', 'editor', 'suggestions', 'notes', 'analysis'].includes(tab)) {
      return tab;
    }
    return 'details';
  };

  const activeSection = ref(getInitialActiveSection());
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
  const resumePagination = ref({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

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

  // Notes editing state
  const isEditingNotes = ref(false);
  const editedNotes = ref('');

  // Format score explanation state
  const showFormatScoreExplanation = ref(false);

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

  const atsResumeKeywords = computed(() => {
    if (!atsScore.value) return [];
    if (typeof atsScore.value === 'number') return [];
    return atsScore.value.resumeKeywords || [];
  });

  const atsMetadata = computed(() => {
    if (!atsScore.value) return null;
    if (typeof atsScore.value === 'number') return null;
    return atsScore.value.metadata || null;
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
  const atsFormatScore = computed(() => {
    if (!resume.value) return null;

    let score = 0;
    const sections = resume.value.sections || resume.value;
    const visibleSections = resume.value?.sections?.visibleSections || [];
    const isVisible = (type) => {
      if (visibleSections.length === 0) return true;
      const sectionConfig = visibleSections.find(s => s.id === type);
      return sectionConfig ? sectionConfig.visible : true; // Default to visible if not found
    };

    // 1. Essential sections (40 points total - 10pts each)
    let essentialScore = 0;

    // Personal info (firstName/lastName count as one section)
    if (isVisible('personal') && (sections.firstName || sections.lastName)) essentialScore += 10;

    // Experience
    if (isVisible('experience') && sections.experience && Array.isArray(sections.experience) && sections.experience.length > 0) {
      essentialScore += 10;
    }

    // Education
    if (isVisible('education') && sections.education && Array.isArray(sections.education) && sections.education.length > 0) {
      essentialScore += 10;
    }

    // Skills
    if (isVisible('skills') && sections.skills && Array.isArray(sections.skills) && sections.skills.length > 0) {
      essentialScore += 10;
    }

    score += essentialScore;

    // 2. Contact info completeness (20 points total - 5pts each for email, phone, location)
    let contactScore = 0;
    if (isVisible('personal')) {
      if (sections.email && sections.email.trim()) contactScore += 5;
      if (sections.phone && sections.phone.trim()) contactScore += 5;
      if (sections.location && sections.location.trim()) contactScore += 5;
      // LinkedIn is bonus but not required
      if (sections.linkedin && sections.linkedin.trim()) contactScore += 5;
    }
    score += Math.min(20, contactScore); // Cap at 20

    // 3. Experience quality (15 points total)
    let experienceScore = 0;
    if (isVisible('experience') && sections.experience && Array.isArray(sections.experience)) {
      const experiences = sections.experience;
      if (experiences.length > 0) {
        // Check if experiences have detailed descriptions
        const detailedExperiences = experiences.filter(exp =>
          exp.description && exp.description.trim().length > 50 // At least 50 chars description
        ).length;
        experienceScore = Math.min(15, (detailedExperiences / experiences.length) * 15);
      }
    }
    score += experienceScore;

    // 4. Education quality (10 points total)
    let educationScore = 0;
    if (isVisible('education') && sections.education && Array.isArray(sections.education)) {
      const educations = sections.education;
      if (educations.length > 0) {
        // Check if education entries have degree and dates
        const completeEducations = educations.filter(edu =>
          edu.degree && edu.degree.trim() &&
          edu.school && edu.school.trim() &&
          edu.startDate && edu.endDate
        ).length;
        educationScore = Math.min(10, (completeEducations / educations.length) * 10);
      }
    }
    score += educationScore;

    // 5. Skills formatting (10 points total)
    let skillsScore = 0;
    if (isVisible('skills') && sections.skills && Array.isArray(sections.skills)) {
      const skills = sections.skills;
      if (skills.length > 0) {
        // Check if skills are properly formatted (not too long descriptions)
        const wellFormattedSkills = skills.filter(skill =>
          skill && skill.trim().length > 0 && skill.trim().length < 50 // Reasonable skill name length
        ).length;
        skillsScore = Math.min(10, (wellFormattedSkills / skills.length) * 10);
      }
    }
    score += skillsScore;

    // 6. Length appropriateness (5 points total)
    let lengthScore = 5; // Start with full points
    const resumeText = displaySections.value.map(section => section.content).join(' ');
    const wordCount = resumeText.split(/\s+/).filter(word => word.length > 0).length;

    // Ideal resume length: 400-800 words (roughly 1-2 pages)
    if (wordCount < 200) lengthScore = 1; // Too short
    else if (wordCount < 400) lengthScore = 3; // A bit short
    else if (wordCount > 1000) lengthScore = 2; // Too long
    else if (wordCount > 800) lengthScore = 4; // A bit long
    // else stays 5

    score += lengthScore;

    return Math.min(100, Math.round(score));
  });

  const atsFormatScoreBreakdown = computed(() => {
    if (!resume.value) return null;

    const sections = resume.value.sections || resume.value;
    const visibleSections = resume.value?.sections?.visibleSections || [];
    const isVisible = (type) => {
      if (visibleSections.length === 0) return true;
      const sectionConfig = visibleSections.find(s => s.id === type);
      return sectionConfig ? sectionConfig.visible : true; // Default to visible if not found
    };

    const breakdown = {
      essentialSections: { score: 0, max: 40, issues: [] },
      contactInfo: { score: 0, max: 20, issues: [] },
      experienceQuality: { score: 0, max: 15, issues: [] },
      educationQuality: { score: 0, max: 10, issues: [] },
      skillsFormatting: { score: 0, max: 10, issues: [] },
      lengthAppropriateness: { score: 5, max: 5, issues: [] },
      sectionVisibility: { score: 0, max: 0, issues: [] } // No score, just advice
    };

    // Essential sections
    if (isVisible('personal')) {
      if (!(sections.firstName || sections.lastName)) {
        breakdown.essentialSections.issues.push('Add your full name - this is the first thing recruiters see and helps ATS systems identify your application');
      } else {
        breakdown.essentialSections.score += 10;
      }
    }

    if (isVisible('experience')) {
      if (!sections.experience || !Array.isArray(sections.experience) || sections.experience.length === 0) {
        breakdown.essentialSections.issues.push('Include a work experience section - most ATS systems expect this core section to evaluate your background');
      } else {
        breakdown.essentialSections.score += 10;
      }
    }

    if (isVisible('education')) {
      if (!sections.education || !Array.isArray(sections.education) || sections.education.length === 0) {
        breakdown.essentialSections.issues.push('Add your educational background - this helps establish your qualifications and is commonly parsed by ATS');
      } else {
        breakdown.essentialSections.score += 10;
      }
    }

    if (isVisible('skills')) {
      if (!sections.skills || !Array.isArray(sections.skills) || sections.skills.length === 0) {
        breakdown.essentialSections.issues.push('Include a skills section - this is crucial for keyword matching and shows your technical competencies');
      } else {
        breakdown.essentialSections.score += 10;
      }
    }

    // Contact info
    if (isVisible('personal')) {
      if (!sections.email || !sections.email.trim()) {
        breakdown.contactInfo.issues.push('Add your email address - essential for recruiters to contact you and commonly parsed by ATS systems');
      } else {
        breakdown.contactInfo.score += 5;
      }

      if (!sections.phone || !sections.phone.trim()) {
        breakdown.contactInfo.issues.push('Include your phone number - provides another way for employers to reach you');
      } else {
        breakdown.contactInfo.score += 5;
      }

      if (!sections.location || !sections.location.trim()) {
        breakdown.contactInfo.issues.push('Add your location/city - helps employers assess relocation needs and local opportunities');
      } else {
        breakdown.contactInfo.score += 5;
      }

      if (sections.linkedin && sections.linkedin.trim()) {
        breakdown.contactInfo.score += 5; // Bonus for LinkedIn
      } else {
        breakdown.contactInfo.issues.push('Consider adding your LinkedIn profile - provides additional professional context and networking opportunities');
      }

      breakdown.contactInfo.score = Math.min(20, breakdown.contactInfo.score);
    }

    // Experience quality
    if (isVisible('experience')) {
      if (sections.experience && Array.isArray(sections.experience)) {
        const experiences = sections.experience;
        if (experiences.length > 0) {
          const detailedExperiences = experiences.filter(exp =>
            exp.description && exp.description.trim().length > 50
          ).length;
          breakdown.experienceQuality.score = Math.min(15, (detailedExperiences / experiences.length) * 15);

          if (detailedExperiences < experiences.length) {
            breakdown.experienceQuality.issues.push(`${experiences.length - detailedExperiences} experience entries lack detailed descriptions. Add quantifiable achievements and responsibilities (aim for 50+ characters each) to better showcase your impact and improve ATS parsing`);
          }
        } else {
          breakdown.experienceQuality.issues.push('No experience entries to evaluate - add your work history to demonstrate your professional background');
        }
      } else {
        breakdown.experienceQuality.issues.push('Experience section not found - this is critical for most job applications and ATS evaluation');
      }
    }

    // Education quality
    if (isVisible('education')) {
      if (sections.education && Array.isArray(sections.education)) {
        const educations = sections.education;
        if (educations.length > 0) {
          const completeEducations = educations.filter(edu =>
            edu.degree && edu.degree.trim() &&
            edu.school && edu.school.trim() &&
            edu.startDate && edu.endDate
          ).length;
          breakdown.educationQuality.score = Math.min(10, (completeEducations / educations.length) * 10);

          if (completeEducations < educations.length) {
            breakdown.educationQuality.issues.push(`${educations.length - completeEducations} education entries are incomplete. Include degree/major, school name, and graduation dates to provide a complete picture of your educational background`);
          }
        } else {
          breakdown.educationQuality.issues.push('No education entries to evaluate - add your academic background to establish your qualifications');
        }
      } else {
        breakdown.educationQuality.issues.push('Education section not found - this helps establish your academic credentials and qualifications');
      }
    }

    // Skills formatting
    if (isVisible('skills')) {
      if (sections.skills && Array.isArray(sections.skills)) {
        const skills = sections.skills;
        if (skills.length > 0) {
          const wellFormattedSkills = skills.filter(skill =>
            skill && skill.trim().length > 0 && skill.trim().length < 50
          ).length;
          breakdown.skillsFormatting.score = Math.min(10, (wellFormattedSkills / skills.length) * 10);

          if (wellFormattedSkills < skills.length) {
            breakdown.skillsFormatting.issues.push(`${skills.length - wellFormattedSkills} skills need better formatting. Keep skill names concise (under 50 characters) and ensure they're properly listed for optimal ATS parsing`);
          }
        } else {
          breakdown.skillsFormatting.issues.push('No skills to evaluate - add relevant technical and soft skills that match the job requirements');
        }
      } else {
        breakdown.skillsFormatting.issues.push('Skills section not found - this is essential for keyword matching and demonstrating your technical competencies');
      }
    }

    // Length appropriateness
    const resumeText = displaySections.value.map(section => section.content).join(' ');
    const wordCount = resumeText.split(/\s+/).filter(word => word.length > 0).length;

    if (wordCount < 200) {
      breakdown.lengthAppropriateness.score = 1;
      breakdown.lengthAppropriateness.issues.push(`Resume is too short (${wordCount} words). Most ATS systems and recruiters expect 400-800 words. Add more details about your achievements and responsibilities`);
    } else if (wordCount < 400) {
      breakdown.lengthAppropriateness.score = 3;
      breakdown.lengthAppropriateness.issues.push(`Resume could be longer (${wordCount} words). Consider expanding on your experience details and adding more quantifiable achievements to reach the ideal 400-800 word range`);
    } else if (wordCount > 1000) {
      breakdown.lengthAppropriateness.score = 2;
      breakdown.lengthAppropriateness.issues.push(`Resume is too long (${wordCount} words). Some ATS systems have character limits. Focus on the most relevant 1-2 years of experience and condense descriptions`);
    } else if (wordCount > 800) {
      breakdown.lengthAppropriateness.score = 4;
      breakdown.lengthAppropriateness.issues.push(`Resume is a bit long (${wordCount} words). Consider minor edits to stay within the optimal 400-800 word range for better ATS compatibility`);
    } else {
      breakdown.lengthAppropriateness.issues.push(`Good length (${wordCount} words) - falls within the ideal 400-800 word range for most ATS systems and recruiters`);
    }

    // Section Visibility Advice
    if (visibleSections.length > 0) {
      // Get hidden sections (those with visible: false)
      const hiddenSections = visibleSections.filter(s => !s.visible).map(s => s.id);
      console.log('Hidden sections:', hiddenSections);

      // Check for critical sections that should never be hidden
      const criticalSections = ['personal', 'experience', 'skills'];
      const hiddenCritical = criticalSections.filter(section => hiddenSections.includes(section));

      if (hiddenCritical.length > 0) {
        breakdown.sectionVisibility.issues.push(`⚠️ Critical sections are hidden: ${hiddenCritical.join(', ')}. These sections (personal info, work experience, skills) are essential for ATS parsing and should typically be visible`);
      }

      // Advice for education
      if (hiddenSections.includes('education')) {
        breakdown.sectionVisibility.issues.push(`📚 Education section is hidden. This is often acceptable for experienced professionals (5+ years) where work experience takes precedence, but consider making it visible if education is relevant to the role`);
      }

      // Advice for certifications
      if (hiddenSections.includes('certifications')) {
        breakdown.sectionVisibility.issues.push(`🏆 Certifications section is hidden. Hide this only if certifications aren't relevant to the job, or if space is limited. Otherwise, keep visible to showcase your qualifications`);
      }

      // Advice for projects
      if (hiddenSections.includes('projects')) {
        breakdown.sectionVisibility.issues.push(`💼 Projects section is hidden. Consider showing this if you have relevant projects that demonstrate your skills, especially for technical roles`);
      }

      // Advice for summary
      if (hiddenSections.includes('summary')) {
        breakdown.sectionVisibility.issues.push(`📝 Professional summary is hidden. This section helps set the tone and highlight key qualifications - consider making it visible unless space is extremely limited`);
      }

      // General advice
      if (hiddenSections.length > 2) {
        breakdown.sectionVisibility.issues.push(`ℹ️ Multiple sections are hidden. While customization is good, ensure you're not hiding too much content that ATS systems and recruiters expect to see`);
      }

      // If no sections are hidden
      if (hiddenSections.length === 0) {
        breakdown.sectionVisibility.issues.push(`✅ All sections are currently visible. Consider hiding less relevant sections (like old education for experienced roles) to optimize space and focus on your strongest qualifications`);
      }
    } else {
      breakdown.sectionVisibility.issues.push(`✅ All sections are currently visible. Consider hiding less relevant sections (like old education for experienced roles) to optimize space and focus on your strongest qualifications`);
    }

    return breakdown;
  });
  const atsKeywordDensity = computed(() => {
    if (!atsScore.value || typeof atsScore.value === 'number') return null;
    const resumeCount = atsScore.value.metadata?.resumeKeywordCount || 0;
    const jobCount = atsScore.value.metadata?.jobKeywordCount || 0;
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
    const visibleSections = sections.visibleSections || [];
    const isVisible = (type) => {
      if (visibleSections.length === 0) return true;
      const sectionConfig = visibleSections.find(s => s.id === type);
      return sectionConfig ? sectionConfig.visible : true; // Default to visible if not found
    };

    const result = [];

    // Personal Info
    if (isVisible('personal') && (sections.firstName || sections.lastName || sections.email || sections.phone || sections.location)) {
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
    if (isVisible('summary') && sections.summary) {
      result.push({
        title: 'Professional Summary',
        content: sections.summary
      });
    }

    // Experience
    if (isVisible('experience') && sections.experience && Array.isArray(sections.experience) && sections.experience.length > 0) {
      result.push({
        title: 'Work Experience',
        content: sections.experience.map(exp =>
          `${exp.title} at ${exp.company}\n${exp.location ? exp.location + '\n' : ''}${exp.startDate} - ${exp.endDate}\n${exp.description || ''}`
        ).join('\n\n')
      });
    }

    // Education
    if (isVisible('education') && sections.education && Array.isArray(sections.education) && sections.education.length > 0) {
      result.push({
        title: 'Education',
        content: sections.education.map(edu =>
          `${edu.degree} in ${edu.field}\n${edu.school}${edu.location ? ', ' + edu.location : ''}\n${edu.startDate} - ${edu.endDate}${edu.gpa ? '\nGPA: ' + edu.gpa : ''}`
        ).join('\n\n')
      });
    }

    // Skills
    if (isVisible('skills') && sections.skills && Array.isArray(sections.skills) && sections.skills.length > 0) {
      result.push({
        title: 'Skills',
        content: sections.skills.join(', ')
      });
    }

    // Certifications
    if (isVisible('certifications') && sections.certifications && Array.isArray(sections.certifications) && sections.certifications.length > 0) {
      result.push({
        title: 'Certifications',
        content: sections.certifications.map(cert =>
          `${cert.name} from ${cert.issuer}${cert.date ? ' (' + cert.date + ')' : ''}${cert.link ? '\n' + cert.link : ''}`
        ).join('\n\n')
      });
    }

    // Projects
    if (isVisible('projects') && sections.projects && Array.isArray(sections.projects) && sections.projects.length > 0) {
      result.push({
        title: 'Projects',
        content: sections.projects.map(proj =>
          `${proj.name}${proj.link ? ' (' + proj.link + ')' : ''}\n${proj.description || ''}`
        ).join('\n\n')
      });
    }

    return result;
  });

  const resumePreviewData = computed(() => {
    if (!resume.value) return {};

    // If resume already has the expected structure, return as is
    if (resume.value.firstName || resume.value.experience) {
      return resume.value;
    }

    // Transform from sections format to ResumePreview format
    const sections = resume.value.sections || {};
    return {
      firstName: sections.firstName || '',
      lastName: sections.lastName || '',
      title: sections.title || resume.value.title || '',
      email: sections.email || '',
      phone: sections.phone || '',
      location: sections.location || '',
      linkedin: sections.linkedin || '',
      summary: sections.summary || '',
      experience: sections.experience || [],
      education: sections.education || [],
      projects: sections.projects || [],
      certifications: sections.certifications || [],
      skills: sections.skills || [],
      customSections: sections.customSections || {}
    };
  });

  const defaultSections = computed(() => {
    // If resume has visibleSections config, use it
    if (resume.value?.sections?.visibleSections && Array.isArray(resume.value.sections.visibleSections)) {
      return resume.value.sections.visibleSections;
    }
    
    // Otherwise, default to showing all sections
    return [];
  });

  // ===== Methods =====
  const loadApplication = async () => {
    if (!applicationIdRef?.value || applicationIdRef.value === 'undefined') return;

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
      atsScore.value = result; // Store the entire result object, not just the score

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
      const result = await improveTextUseCase.execute(text);
      const improved = result.variations && result.variations.length > 0 ? result.variations[0] : result.originalText;
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

  const handleAutoInsert = async (keyword) => {
    if (!resume.value) return;

    try {
      // Create a copy of the resume to modify
      const updatedResume = { ...resume.value };

      // Ensure sections exist
      if (!updatedResume.sections) {
        updatedResume.sections = {};
      }

      // Handle different resume formats
      if (Array.isArray(updatedResume.sections)) {
        // AI generated format - find or create skills section
        let skillsSection = updatedResume.sections.find(section => 
          section.type === 'skills' || section.title?.toLowerCase().includes('skill')
        );

        if (!skillsSection) {
          skillsSection = {
            type: 'skills',
            title: 'Skills',
            content: ''
          };
          updatedResume.sections.push(skillsSection);
        }

        // Add keyword to skills content if not already present
        const currentSkills = skillsSection.content || '';
        const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(s => s);
        
        if (!skillsArray.includes(keyword)) {
          skillsArray.push(keyword);
          skillsSection.content = skillsArray.join(', ');
        }
      } else {
        // Builder format - ensure skills array exists
        if (!updatedResume.sections.skills) {
          updatedResume.sections.skills = [];
        }

        // Add keyword if not already present
        if (!updatedResume.sections.skills.includes(keyword)) {
          updatedResume.sections.skills.push(keyword);
        }
      }

      // Update the resume
      await updateResume(updatedResume);

    } catch (err) {
      error.value = 'Failed to add keyword to resume. Please try again.';
      console.error('Error auto-inserting keyword:', err);
    }
  };

  const switchSection = async (section) => {
    activeSection.value = section;

    // Update URL params
    await router.replace({
      query: {
        ...route.query,
        tab: section
      }
    });

    // Auto-calculate ATS score when switching to analysis tab
    if (section === 'analysis' && !atsScore.value && job.value?.jobDescription && resume.value && !isCalculatingAts.value) {
      try {
        await calculateAts();
      } catch (err) {
        console.error('Failed to auto-calculate ATS score:', err);
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

  const loadUserResumes = async (options = {}) => {
    isLoadingResumes.value = true;
    error.value = null;

    try {
      const { page = 1, limit = resumePagination.value.limit } = options;
      const result = await listResumesUseCase.execute({ page, limit });
      userResumes.value = result.resumes || [];
      resumePagination.value = result.pagination || resumePagination.value;
    } catch (err) {
      error.value = 'Failed to load resumes. Please try again.';
      console.error('Error loading user resumes:', err);
    } finally {
      isLoadingResumes.value = false;
    }
  };

  const goToResumePage = async (page) => {
    if (page >= 1 && page <= resumePagination.value.totalPages) {
      await loadUserResumes({ page, limit: resumePagination.value.limit });
    }
  };

  const goToResumeNext = async () => {
    if (resumePagination.value.hasNext) {
      await loadUserResumes({ page: resumePagination.value.page + 1, limit: resumePagination.value.limit });
    }
  };

  const goToResumePrevious = async () => {
    if (resumePagination.value.hasPrev) {
      await loadUserResumes({ page: resumePagination.value.page - 1, limit: resumePagination.value.limit });
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
    await loadUserResumes({ page: 1 });
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
    await loadUserResumes({ page: 1 });
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

  // TODO: need to be tested
  const applySummarySuggestion = async (suggestion) => {
    const currentSummary = resume.value.sections.summary || '';
    const prompt = `Improve this professional summary based on the following suggestion: "${suggestion.text}". Current summary: "${currentSummary}"`;

    try {
      const result = await improveTextUseCase.execute(prompt);
      const improvedSummary = result.variations && result.variations.length > 0 ? result.variations[0] : result.originalText;

      await updateResume({
        id: resume.value.id,
        sections: {
          ...resume.value.sections,
          summary: improvedSummary
        }
      });

      console.log('Summary improved:', improvedSummary);
    } catch (error) {
      console.error('Failed to improve summary:', error);
      throw error;
    }
  };

  // TODO: need to be tested
  const applyExperienceSuggestion = async (suggestion) => {
    const experiences = resume.value.sections.experience || [];

    if (!Array.isArray(experiences) || experiences.length === 0) {
      console.log('No experience entries to improve');
      return;
    }

    const improvedExperiences = await Promise.all(
      experiences.map(async (exp) => {
        if (!exp.description || exp.description.trim().length === 0) {
          return exp; // No description to improve
        }

        const prompt = `Improve this work experience description based on the following suggestion: "${suggestion.text}". Current description: "${exp.description}"`;

        try {
          const result = await improveTextUseCase.execute(prompt);
          const improvedDescription = result.variations && result.variations.length > 0 ? result.variations[0] : result.originalText;
          return { ...exp, description: improvedDescription };
        } catch (error) {
          console.error('Failed to improve experience description:', error);
          return exp; // Return original if improvement fails
        }
      })
    );

    try {
      await updateResume({
        id: resume.value.id,
        sections: {
          ...resume.value.sections,
          experience: improvedExperiences
        }
      });

      console.log('Experience descriptions improved');
    } catch (error) {
      console.error('Failed to update resume with improved experience:', error);
      throw error;
    }
  };

  // TODO: need to be tested
  const applyQuantifySuggestion = async (suggestion) => {
    const experiences = resume.value.sections.experience || [];

    if (!Array.isArray(experiences) || experiences.length === 0) {
      console.log('No experience entries to quantify');
      return;
    }

    const quantifiedExperiences = await Promise.all(
      experiences.map(async (exp) => {
        if (!exp.description || exp.description.trim().length === 0) {
          return exp; // No description to quantify
        }

        const prompt = `Add quantifiable metrics and specific numbers to this work experience description based on the following suggestion: "${suggestion.text}". Make achievements measurable with percentages, numbers, or concrete results. Current description: "${exp.description}"`;

        try {
          const result = await improveTextUseCase.execute(prompt);
          const quantifiedDescription = result.variations && result.variations.length > 0 ? result.variations[0] : result.originalText;
          return { ...exp, description: quantifiedDescription };
        } catch (error) {
          console.error('Failed to quantify experience description:', error);
          return exp; // Return original if quantification fails
        }
      })
    );

    try {
      await updateResume({
        id: resume.value.id,
        sections: {
          ...resume.value.sections,
          experience: quantifiedExperiences
        }
      });

      console.log('Experience descriptions quantified with metrics');
    } catch (error) {
      console.error('Failed to update resume with quantified experience:', error);
      throw error;
    }
  };

  // TODO: need to be teste
  const applyImpactSuggestion = async (suggestion) => {
    const experiences = resume.value.sections.experience || [];

    if (!Array.isArray(experiences) || experiences.length === 0) {
      console.log('No experience entries to enhance impact');
      return;
    }

    const enhancedExperiences = await Promise.all(
      experiences.map(async (exp) => {
        if (!exp.description || exp.description.trim().length === 0) {
          return exp; // No description to enhance
        }

        const prompt = `Strengthen the action verbs and enhance the impact of achievements in this work experience description based on the following suggestion: "${suggestion.text}". Use powerful action verbs and make accomplishments more compelling. Current description: "${exp.description}"`;

        try {
          const result = await improveTextUseCase.execute(prompt);
          const enhancedDescription = result.variations && result.variations.length > 0 ? result.variations[0] : result.originalText;
          return { ...exp, description: enhancedDescription };
        } catch (error) {
          console.error('Failed to enhance experience description impact:', error);
          return exp; // Return original if enhancement fails
        }
      })
    );

    try {
      await updateResume({
        id: resume.value.id,
        sections: {
          ...resume.value.sections,
          experience: enhancedExperiences
        }
      });

      console.log('Experience descriptions enhanced with stronger impact');
    } catch (error) {
      console.error('Failed to update resume with enhanced experience:', error);
      throw error;
    }
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

  // Notes Editing Methods
  const startEditingNotes = () => {
    if (!job.value) return;
    isEditingNotes.value = true;
    editedNotes.value = job.value.notes || '';
  };

  const cancelEditingNotes = () => {
    isEditingNotes.value = false;
    editedNotes.value = '';
  };

  const saveNotes = async () => {
    if (!job.value) return;

    try {
      const updatedApplication = {
        ...job.value,
        notes: editedNotes.value.trim() || null
      };

      const result = await updateJobApplicationUseCase.execute({
        application: updatedApplication
      });

      // Update the local job object
      Object.assign(job.value, result);

      isEditingNotes.value = false;
      editedNotes.value = '';

      console.log('Notes updated successfully');
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const updateApplicationStatus = async (applicationId, status, application) => {
    if (!application) return;

    try {
      const updatedApplication = {
        ...application,
        status: status
      };

      const result = await updateJobApplicationUseCase.execute({
        application: updatedApplication
      });

      // Update the local job object
      Object.assign(job.value, result);
      console.log('Application status updated successfully');
    } catch (error) {
      console.error('Failed to update application status:', error);
      throw error;
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
    resumePagination,

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

    // Notes editing state
    isEditingNotes,
    editedNotes,

    // Format score explanation state
    showFormatScoreExplanation,

    // Computed
    resumeText,
    atsScorePercent,
    displaySections,
    resumePreviewData,
    defaultSections,

    // ATS Analysis
    atsMatchedKeywords,
    atsMissedKeywords,
    atsJobKeywords,
    atsResumeKeywords,
    atsMetadata,
    atsSkillRelevance,
    atsFormatScore,
    atsFormatScoreBreakdown,
    atsKeywordDensity,

    // Methods
    loadApplication,
    loadResume,
    calculateAts,
    generateTailoredResume,
    improveSection,
    updateResume,
    handleAutoInsert,
    switchSection,
    toggleKeywordSelection,
    loadUserResumes,
    goToResumePage,
    goToResumeNext,
    goToResumePrevious,
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
    handleJobFormSubmit,

    // Notes Editing Methods
    startEditingNotes,
    cancelEditingNotes,
    saveNotes,
    updateApplicationStatus
  };
}
