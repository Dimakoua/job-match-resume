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
    const userPrompt = this._buildUserPrompt(command.jobDescription);

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
    return `You are an expert resume writer. Generate a complete, professional resume based on a job description.

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
          "achievements": [
            "Quantified achievement with metrics",
            "Another key accomplishment",
            "Technical skill or responsibility"
          ]
        }
      ]
    },
    {
      "type": "education",
      "title": "Education",
      "content": [
        {
          "institution": "University Name",
          "degree": "Degree Name",
          "field": "Field of Study",
          "location": "City, State",
          "graduationDate": "MM/YYYY",
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
    }
  ]
}

Guidelines:
- Make all content realistic and professional
- Include 2-3 work experiences relevant to the job
- Add appropriate education background
- Include relevant skills based on the job requirements
- Use proper date formats (MM/YYYY)
- Keep achievements specific and quantifiable where possible
- Ensure the resume is ATS-friendly`;
  }

  _buildUserPrompt(jobDescription) {
    return `Generate a complete resume for someone applying to this job:

${jobDescription}

Create realistic but professional content that would be compelling for this position. Focus on experiences and skills that align with the job requirements.`;
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

    // Transform to our internal format if needed
    return aiResponse.sections;
  }
}