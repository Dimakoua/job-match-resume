const promptTemplate = `
    Please optimize the following resume to align with the provided job description while preserving its original format, structure, and professional style. 
    Ensure that the revised resume is ATS-friendly and tailored for maximum compatibility with Applicant Tracking Systems (ATS) while maintaining readability and a natural flow.
    You may refer to the candidate's GitHub, LinkedIn profile, or personal website listed in the resume to gather additional information about their skills, projects, and professional background.

    ### **Resume Optimization Requirements:**
    1. **Keyword Optimization:** Extract and incorporate relevant keywords, skills, and job titles from the job description naturally without overstuffing.
    2. **Experience Alignment:** Adjust bullet points and descriptions to better reflect the key responsibilities and qualifications required in the job description.
    3. **Action-Oriented Language:** Improve phrasing by using strong action verbs and concise language to emphasize achievements and impact.
    4. **Quantifiable Impact:** Where applicable, enhance bullet points with measurable results to showcase accomplishments effectively.
    5. **ATS Optimization Score:** Provide an estimated ATS compatibility score (0-100%) based on keyword relevance, formatting compliance, and overall alignment with the job description.
    6. **explanation**: should describe why the score was assigned.
    7. Ensure that the response adheres to this structure exactly.
    8. If any fields are missing, please add them as empty strings or as a placeholder.

    ### **Resume Content:**
    {{resumeText}}

    ### **Job Description:**
    {{jobDescription}}

    ### **Output Format:**
    Provide the optimized resume in JSON format strictly following this structure:
    
    \`\`\`json
    {
        "optimizedResume": {
            "personal_info": {
                "name": "string",
                "email": "string",
                "phone": "string",
                "location": "string",
                "linkedin": "string",
                "github": "string"
            },
            "objective": "string",
            "experience": [
                {
                    "position": "string",
                    "company": "string",
                    "duration": "string",
                    "location": "string",
                    "achievements": ["string"]
                }
            ],
            "projects": [
                {
                    "name": "string",
                    "date": "string",
                    "link": "string",
                    "description": ["string"]
                }
            ],
            "education": [
                {
                    "degree": "string",
                    "university": "string",
                    "years": "string"
                }
            ],
            "skills": {
                "technical": ["string"],
                "non_technical": ["string"]
            }
        },
        "ATSCompatibilityScore": 0-100,
        "explanation": "string"
        "recomendedFileName": "string.docx"
    }
    \`\`\`
`;

const ENV_TOKENS = {
  gemini: process.env.GEMINI_API_KEY,
  gpt: process.env.OPENAI_API_KEY,
  claude: process.env.ANTHROPIC_API_KEY
};

function buildPrompt(resumeText, jobDescription) {
  return promptTemplate
    .replace("{{resumeText}}", resumeText) // we assume the template only has one placeholder for each
    .replace("{{jobDescription}}", jobDescription);
}

function parseResponse(responseText) {
  if (!responseText) {
    return {
      optimizedResume: {},
      ATSCompatibilityScore: "N/A",
      explanation: "Empty response received from the AI provider.",
      recomendedFileName: "optimized_resume.docx"
    };
  }

  const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const parsedData = JSON.parse(cleanedResponse);

    return {
      optimizedResume: parsedData.optimizedResume || {},
      ATSCompatibilityScore: parsedData.ATSCompatibilityScore ?? "N/A",
      explanation: parsedData.explanation || "Explanation not available.",
      recomendedFileName: parsedData.recomendedFileName || "optimized_resume.docx"
    };
  } catch (error) {
    return {
      optimizedResume: {},
      ATSCompatibilityScore: "N/A",
      explanation: `Failed to parse AI response: ${error.message}`,
      recomendedFileName: "optimized_resume.docx"
    };
  }
}

function resolveToken(model, overrideToken) {
  if (overrideToken && overrideToken.trim().length > 0) {
    return overrideToken.trim();
  }

  return ENV_TOKENS[model];
}

async function optimizeResumeWithGemini(resumeText, jobDescription, token) {
  const prompt = buildPrompt(resumeText, jobDescription);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}`);
  }

  const data = await response.json();
  const rawResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  return parseResponse(rawResponseText);
}

async function optimizeResumeWithGPT(resumeText, jobDescription, token) {
  const prompt = buildPrompt(resumeText, jobDescription);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Optimize the resume for ATS compatibility based on the job description while retaining its original format."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error ${response.status}`);
  }

  const data = await response.json();
  const rawResponseText = data?.choices?.[0]?.message?.content;

  return parseResponse(rawResponseText);
}

async function optimizeResumeWithClaude(resumeText, jobDescription, token) {
  const prompt = buildPrompt(resumeText, jobDescription);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": token,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: "Optimize the resume for ATS compatibility while keeping its format intact."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error ${response.status}`);
  }

  const data = await response.json();
  const rawResponseText = data?.completion;

  return parseResponse(rawResponseText);
}

async function optimizeResumeWithAI(resumeText, jobDescription, ai) {
  const model = ai?.model;
  const token = resolveToken(model, ai?.token);

  if (!model || !token) {
    throw new Error("Missing AI model selection or API token.");
  }

  switch (model) {
    case "gpt":
      return optimizeResumeWithGPT(resumeText, jobDescription, token);
    case "gemini":
      return optimizeResumeWithGemini(resumeText, jobDescription, token);
    case "claude":
      return optimizeResumeWithClaude(resumeText, jobDescription, token);
    default:
      throw new Error("Unsupported AI model selected.");
  }
}

module.exports = {
  optimizeResumeWithAI
};
