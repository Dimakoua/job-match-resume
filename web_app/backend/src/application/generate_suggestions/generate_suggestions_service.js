export class GenerateSuggestionsService {
  constructor(aiAdapter) {
    this.aiAdapter = aiAdapter;
  }

  async execute(command) {
    // Validate command
    if (!command.jobDescription || typeof command.jobDescription !== 'string' || command.jobDescription.trim().length === 0) {
      throw new Error('jobDescription is required and must be a non-empty string');
    }

    if (!command.resumeText || typeof command.resumeText !== 'string' || command.resumeText.trim().length === 0) {
      throw new Error('resumeText is required and must be a non-empty string');
    }

    if (command.jobDescription.length > 10000) {
      throw new Error('jobDescription must be less than 10,000 characters');
    }

    if (command.resumeText.length > 10000) {
      throw new Error('resumeText must be less than 10,000 characters');
    }

    // Construct AI prompt
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(command.jobDescription, command.resumeText);

    // Generate suggestions using AI
    const aiResponse = await this.aiAdapter.generateJSON(systemPrompt, userPrompt);

    // Validate and transform AI response
    const suggestions = this._validateAndTransformResponse(aiResponse);

    return suggestions;
  }

  _buildSystemPrompt() {
    return `You are an expert resume consultant and ATS specialist. Analyze the job description and current resume, then provide specific, actionable suggestions to improve the resume's match for this position.

Return suggestions in this exact JSON format:
{
  "suggestions": [
    {
      "category": "keywords",
      "text": "Add these specific keywords to your resume: [list 3-5 relevant keywords from job description]"
    },
    {
      "category": "summary",
      "text": "One specific improvement for the professional summary"
    },
    {
      "category": "experience",
      "text": "One specific way to enhance work experience descriptions"
    },
    {
      "category": "skills",
      "text": "Specific skills to highlight or add"
    },
    {
      "category": "education",
      "text": "If applicable, improvements for education section"
    },
    {
      "category": "quantify",
      "text": "How to add quantifiable achievements"
    },
    {
      "category": "ats",
      "text": "ATS-specific optimization tips"
    },
    {
      "category": "impact",
      "text": "How to make achievements more impactful"
    }
  ]
}

Guidelines:
- Provide 6-8 suggestions covering different categories
- Each suggestion should be specific and actionable
- Focus on improving job match and ATS score
- Use professional, ATS-friendly language
- Base suggestions on actual job description content
- Keep each suggestion concise but clear`;
  }

  _buildUserPrompt(jobDescription, resumeText) {
    return `JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resumeText}

Please analyze the above job description and resume, then provide targeted suggestions for improvement.`;
  }

  _validateAndTransformResponse(aiResponse) {
    // Validate AI response structure
    if (!aiResponse || typeof aiResponse !== 'object') {
      throw new Error('Invalid AI response format');
    }

    if (!aiResponse.suggestions || !Array.isArray(aiResponse.suggestions)) {
      throw new Error('AI response must contain a suggestions array');
    }

    // Validate and transform each suggestion
    const validCategories = ['keywords', 'summary', 'experience', 'skills', 'education', 'quantify', 'ats', 'impact'];

    const suggestions = aiResponse.suggestions
      .filter(suggestion => {
        return suggestion &&
               typeof suggestion === 'object' &&
               typeof suggestion.category === 'string' &&
               typeof suggestion.text === 'string' &&
               suggestion.text.trim().length > 0 &&
               validCategories.includes(suggestion.category.toLowerCase());
      })
      .map(suggestion => ({
        category: suggestion.category.toLowerCase(),
        text: suggestion.text.trim()
      }))
      .slice(0, 8); // Limit to 8 suggestions

    if (suggestions.length === 0) {
      throw new Error('No valid suggestions generated');
    }

    return suggestions;
  }
}