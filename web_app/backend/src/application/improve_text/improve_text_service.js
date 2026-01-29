export class ImproveTextService {
  constructor(aiAdapter) {
    this.aiAdapter = aiAdapter;
  }

  async execute(command) {
    // Validate command
    if (!command.text || typeof command.text !== 'string' || command.text.trim().length === 0) {
      throw new Error('text is required and must be a non-empty string');
    }

    if (command.text.length > 10000) {
      throw new Error('text must be less than 10,000 characters');
    }

    // Construct AI prompt
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(command.text);

    // Generate improved text variations using AI
    const aiResponse = await this.aiAdapter.generateJSON(systemPrompt, userPrompt);

    // Validate and transform AI response
    const variations = this._validateAndTransformResponse(aiResponse);

    return {
      originalText: command.text,
      variations: variations
    };
  }

  _buildSystemPrompt() {
    return `You are an expert resume writer and editor. Your task is to improve resume text by providing 3 different polished variations.

Guidelines for improvements:
- Make the text more professional and impactful
- Use strong action verbs and quantifiable achievements where possible
- Keep the same meaning but enhance clarity and professionalism
- Ensure ATS-friendly language (avoid complex formatting)
- Keep each variation concise but comprehensive
- Maintain the original intent and key information
- Use industry-appropriate terminology

Return exactly 3 variations in this JSON format:
{
  "variations": [
    "First improved version of the text",
    "Second improved version with different phrasing",
    "Third improved version with alternative approach"
  ]
}

Each variation should be a complete, improved version of the input text.`;
  }

  _buildUserPrompt(text) {
    return `Please improve this resume text by providing 3 different polished variations:

"${text}"

Create 3 distinct versions that enhance the professionalism, impact, and clarity while maintaining the original meaning.`;
  }

  _validateAndTransformResponse(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'object') {
      throw new Error('AI response must be a valid JSON object');
    }

    if (!aiResponse.variations || !Array.isArray(aiResponse.variations)) {
      throw new Error('AI response must contain a variations array');
    }

    if (aiResponse.variations.length !== 3) {
      throw new Error('AI response must contain exactly 3 variations');
    }

    // Validate each variation
    for (let i = 0; i < aiResponse.variations.length; i++) {
      const variation = aiResponse.variations[i];
      if (typeof variation !== 'string' || variation.trim().length === 0) {
        throw new Error(`Variation ${i + 1} must be a non-empty string`);
      }
      if (variation.length > 2000) {
        throw new Error(`Variation ${i + 1} must be less than 2,000 characters`);
      }
    }

    return aiResponse.variations;
  }
}