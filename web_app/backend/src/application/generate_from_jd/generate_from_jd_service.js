import { Resume } from '../../domain/resume/resume.js';

export class GenerateFromJDService {
  constructor(aiAdapter, resumeRepository, templateRepository) {
    this.aiAdapter = aiAdapter;
    this.resumeRepository = resumeRepository;
    this.templateRepository = templateRepository;
  }

  async execute(command) {
    // Validate command
    if (!command.userId) {
      throw new Error('userId is required');
    }
    if (command.jobDescription === undefined || command.jobDescription === null) {
      throw new Error('jobDescription is required');
    }
    if (typeof command.jobDescription !== 'string' || command.jobDescription.trim().length === 0) {
      throw new Error('jobDescription must be a non-empty string');
    }
    if (command.userData === undefined || command.userData === null) {
      throw new Error('userData is required');
    }
    if (typeof command.userData !== 'string' || command.userData.trim().length === 0) {
      throw new Error('userData must be a non-empty string');
    }

    // Validate template if specified
    if (command.templateId) {
      try {
        await this.templateRepository.getSections(command.templateId);
      } catch (error) {
        throw new Error(`Invalid template: ${command.templateId}`);
      }
    }

    // Generate ID
    const id = crypto.randomUUID();

    // Construct AI prompt
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(command.jobDescription, command.userData);

    // Generate resume content using AI
    const aiResponse = await this.aiAdapter.generateJSON(systemPrompt, userPrompt);

    // Validate and transform AI response
    const sections = this._validateAndTransformResponse(aiResponse);

    // Use specified template or default for AI-generated resumes
    const templateId = command.templateId || 'professional';

    // Create resume
    const resume = new Resume(id, command.userId, 'AI Generated Resume', sections, templateId);

    // Save
    await this.resumeRepository.save(resume);

    return resume;
  }

  _buildSystemPrompt() {
    return `You are an expert resume writer. You will be given two inputs:
1. A job description (the target role)
2. The user's current resume/CV data

Your task: Tailor the user's ACTUAL experience and skills to match the job requirements. Do NOT invent fictional content. Use only the information provided by the user, but reframe and optimize it to align with the job description.

Return the resume as a JSON object with the following structure:
{
  "sections": [
    {
      "type": "personal_info",
      "title": "Personal Information",
      "content": {
        "name": "Professional Name",
        "email": "professional@email.com",
        "phone": "(555) 123-4567",
        "location": "City, State",
        "linkedin": "https://linkedin.com/in/username",
        "website": "https://portfolio.com"
      }
    },
    {
      "type": "summary",
      "title": "Professional Summary",
      "content": "A compelling 3-4 sentence summary highlighting key qualifications and career goals."
    },
    {
      "type": "experience",
      "title": "Work Experience",
      "content": [
        {
          "company": "Company Name",
          "position": "Job Title",
          "location": "City, State",
          "startDate": "MM/YYYY",
          "endDate": "MM/YYYY or Present",
          "description": "Detailed description of responsibilities and achievements. Include quantified metrics and key accomplishments relevant to the target role."
        }
      ]
    },
    {
      "type": "education",
      "title": "Education",
      "content": [
        {
          "school": "University Name",
          "degree": "Degree Name",
          "field": "Field of Study",
          "location": "City, State",
          "startDate": "MM/YYYY",
          "endDate": "MM/YYYY",
          "gpa": "3.8/4.0 (optional)"
        }
      ]
    },
    {
      "type": "skills",
      "title": "Skills",
      "content": {
        "technical": ["Skill 1", "Skill 2", "Skill 3"],
        "soft": ["Communication", "Leadership", "Problem Solving"],
        "tools": ["Tool 1", "Tool 2", "Tool 3"]
      }
    },
    {
      "type": "certifications",
      "title": "Certifications",
      "content": [
        {
          "name": "Certification Name",
          "issuer": "Issuing Organization",
          "date": "MM/YYYY",
          "link": "https://example.com/credential (optional)"
        }
      ]
    },
    {
      "type": "projects",
      "title": "Projects",
      "content": [
        {
          "name": "Project Name",
          "link": "https://github.com/username/project",
          "description": "Brief description of the project and your role"
        }
      ]
    }
  ]
}

Guidelines:
- Extract contact information from the user's data (name, email, phone, location, LinkedIn)
- Rewrite work experience bullet points to emphasize skills/achievements relevant to the target job
- Highlight transferable skills that match the job requirements
- Reorder or emphasize certain experiences if they're more relevant to the role
- Keep the user's factual information (companies, dates, degrees) unchanged
- Add quantifiable metrics where the user provided them
- Use proper date formats (MM/YYYY)
- Ensure the resume is ATS-friendly and professional
- Include certifications and projects sections if the user has relevant credentials or portfolio work
- You can create additional custom sections (e.g., "Publications", "Awards", "Volunteer Work") if the user's data includes such information and it's relevant to the job
- For custom sections, use type: "custom_{section_name}" (e.g., "custom_awards") and provide content as an array or string depending on the data
- If the user's data is incomplete, work with what's provided`;
  }

  _buildUserPrompt(jobDescription, userData) {
    return `JOB DESCRIPTION:
${jobDescription}

---

USER'S CURRENT RESUME/CV:
${userData}

---

Please tailor the user's resume to match this job description. Reframe their experience and skills to highlight relevance to the role. Use their actual data - do not invent fictional experience.`;
  }

  _validateAndTransformResponse(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'object') {
      throw new Error('AI response must be a valid JSON object');
    }

    if (!aiResponse.sections || !Array.isArray(aiResponse.sections)) {
      throw new Error('AI response must contain a sections array');
    }

    // Basic validation - ensure required sections exist
    const requiredSectionTypes = ['personal_info', 'summary', 'experience', 'education', 'skills'];
    const presentTypes = aiResponse.sections.map(section => section.type);

    for (const requiredType of requiredSectionTypes) {
      if (!presentTypes.includes(requiredType)) {
        throw new Error(`AI response missing required section: ${requiredType}`);
      }
    }

    // Transform to flat Builder format
    const sectionsObject = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      title: '',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      customSections: {},
      layout: {
        template: 'basic'
      },
      style: {
        accentColor: '#2463eb',
        bodyFont: 'inter',
        fontSize: 11,
        headingFont: 'inter',
        lineHeight: 1.5
      },
      visibleSections: [
        { id: 'personal', label: 'Personal Info', required: true, visible: true },
        { id: 'summary', label: 'Professional Summary', visible: true },
        { id: 'experience', label: 'Work Experience', visible: true },
        { id: 'skills', label: 'Skills', visible: true },
        { id: 'education', label: 'Education', visible: false },
        { id: 'certifications', label: 'Certifications', visible: false },
        { id: 'projects', label: 'Projects', visible: false }
      ]
    };

    // Extract data from AI sections
    for (const section of aiResponse.sections) {
      switch (section.type) {
        case 'personal_info':
          const content = section.content || {};
          const nameStr = content.name || '';
          const nameParts = nameStr.trim().split(/\s+/);
          
          sectionsObject.firstName = nameParts[0] || '';
          sectionsObject.lastName = nameParts.slice(1).join(' ') || '';
          sectionsObject.email = content.email || '';
          sectionsObject.phone = content.phone || '';
          sectionsObject.location = content.location || '';
          sectionsObject.linkedin = content.linkedin || '';
          break;

        case 'summary':
          sectionsObject.summary = section.content || '';
          break;

        case 'experience':
          if (Array.isArray(section.content)) {
            sectionsObject.experience = section.content.map(exp => ({
              company: exp.company || '',
              title: exp.position || '',
              location: exp.location || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              description: exp.description || ''
            }));
          }
          break;

        case 'education':
          if (Array.isArray(section.content)) {
            sectionsObject.education = section.content.map(edu => ({
              school: edu.school || '',
              degree: edu.degree || '',
              field: edu.field || '',
              location: edu.location || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
              gpa: edu.gpa || ''
            }));
          }
          break;

        case 'skills':
          if (section.content) {
            // Flatten all skill categories into a single array
            const allSkills = [];
            if (Array.isArray(section.content.technical)) {
              allSkills.push(...section.content.technical);
            }
            if (Array.isArray(section.content.soft)) {
              allSkills.push(...section.content.soft);
            }
            if (Array.isArray(section.content.tools)) {
              allSkills.push(...section.content.tools);
            }
            sectionsObject.skills = allSkills;
          }
          break;

        case 'certifications':
          if (Array.isArray(section.content)) {
            sectionsObject.certifications = section.content.map(cert => ({
              name: cert.name || '',
              issuer: cert.issuer || '',
              date: cert.date || '',
              link: cert.link || ''
            }));
          }
          break;

        case 'projects':
          if (Array.isArray(section.content)) {
            sectionsObject.projects = section.content.map(proj => ({
              name: proj.name || '',
              link: proj.link || '',
              description: proj.description || ''
            }));
          }
          break;

        default:
          // Handle custom sections (e.g., custom_awards, custom_publications)
          if (section.type.startsWith('custom_')) {
            const customKey = section.type.replace('custom_', '');
            sectionsObject.customSections[customKey] = section.content;
          }
          break;
      }
    }

    return sectionsObject;
  }

}