export class ParseResumeTextService {
  constructor(aiAdapter) {
    this.aiAdapter = aiAdapter;
  }

  async execute(command) {
    // Validate command
    if (!command.text || typeof command.text !== 'string' || command.text.trim().length === 0) {
      throw new Error('text is required and must be a non-empty string');
    }

    if (command.text.length > 50000) {
      throw new Error('text must be less than 50,000 characters');
    }

    // Construct AI prompt
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(command.text);

    // Parse resume text using AI
    const aiResponse = await this.aiAdapter.generateJSON(systemPrompt, userPrompt);

    // Validate and transform AI response
    const parsedResume = this._validateAndTransformResponse(aiResponse);

    return parsedResume;
  }

  _buildSystemPrompt() {
    return `You are an expert at parsing resume text into structured data. Your task is to extract and organize information from unstructured resume text into a clean JSON format.

Guidelines for parsing:
- Extract personal information (name, contact details, location, LinkedIn, etc.)
- Identify and extract work experience with company, title, dates, and descriptions
- Extract education information with institution, degree, dates
- Identify skills, certifications, and projects
- Maintain accuracy and don't add information that isn't in the text
- Use standard date formats where possible (e.g., "Jan 2020 - Dec 2022")
- For experience descriptions, keep them as detailed paragraphs
- If information is missing, use empty strings or empty arrays rather than making assumptions

Return the parsed resume in this exact JSON format:
{
  "firstName": "string",
  "lastName": "string",
  "title": "string (current or most recent job title)",
  "email": "string",
  "phone": "string",
  "location": "string (city, state/country)",
  "linkedin": "string (full URL or username)",
  "summary": "string (professional summary if present)",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string (use 'Present' if current)",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "skills": ["string"],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string"
    }
  ]
}`;
  }

  _buildUserPrompt(text) {
    return `Parse the following resume text into structured JSON format:

${text}

Extract all available information and organize it according to the specified format. If certain sections are missing, use empty arrays or empty strings.`;
  }

  _validateAndTransformResponse(aiResponse) {
    // Validate required structure
    if (!aiResponse || typeof aiResponse !== 'object') {
      throw new Error('Invalid AI response format');
    }

    // Ensure all required fields exist with defaults
    const parsedResume = {
      firstName: aiResponse.firstName || '',
      lastName: aiResponse.lastName || '',
      title: aiResponse.title || '',
      email: aiResponse.email || '',
      phone: aiResponse.phone || '',
      location: aiResponse.location || '',
      linkedin: aiResponse.linkedin || '',
      summary: aiResponse.summary || '',
      experience: Array.isArray(aiResponse.experience) ? aiResponse.experience : [],
      education: Array.isArray(aiResponse.education) ? aiResponse.education : [],
      skills: Array.isArray(aiResponse.skills) ? aiResponse.skills : [],
      certifications: Array.isArray(aiResponse.certifications) ? aiResponse.certifications : [],
      projects: Array.isArray(aiResponse.projects) ? aiResponse.projects : []
    };

    // Validate experience entries
    parsedResume.experience = parsedResume.experience.map(exp => ({
      company: exp.company || '',
      title: exp.title || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: exp.description || ''
    }));

    // Validate education entries
    parsedResume.education = parsedResume.education.map(edu => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || ''
    }));

    // Validate certifications
    parsedResume.certifications = parsedResume.certifications.map(cert => ({
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || ''
    }));

    // Validate projects
    parsedResume.projects = parsedResume.projects.map(proj => ({
      name: proj.name || '',
      description: proj.description || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
      url: proj.url || ''
    }));

    return parsedResume;
  }
}