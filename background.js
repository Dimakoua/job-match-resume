const RESUME_PROMPT = `
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
        "explanation": "string",
        "recomendedFileName": "string.docx"
    }
    \`\`\`
`;

const COVER_LETTER_PROMPT = `
Act as an expert career coach and professional writer.
I will provide a candidate's resume and a job description.
Write a compelling, personalized cover letter (~3 paragraphs, 250-350 words) that:
1. Opens with a strong hook connecting the candidate's background to the specific role and company
2. Highlights 2-3 key achievements from the resume that directly match the job requirements
3. Closes with a confident call to action

Rules:
- Do NOT invent experience not present in the resume
- Use a professional but warm and confident tone
- Address the letter to "Hiring Manager" if no specific name is available
- Do not add a subject line or date; start directly with the salutation

Return ONLY valid JSON with no markdown fencing:
{
  "coverLetter": "Full cover letter text. Use \\n for paragraph breaks.",
  "recommendedFileName": "Cover_Letter.docx"
}

### Candidate Resume:
{{resumeText}}

### Job Description:
{{jobDescription}}
`;

function getPrompt(resumeText, jobDescription) {
    return RESUME_PROMPT.replace("{{resumeText}}", resumeText).replace("{{jobDescription}}", jobDescription);
}

function getCoverLetterPrompt(resumeText, jobDescription) {
    return COVER_LETTER_PROMPT.replace("{{resumeText}}", resumeText).replace("{{jobDescription}}", jobDescription);
}

// Generic function to parse AI response
function parseResponse(responseText) {
    // Remove any leading or trailing backticks or markdown formatting (like ```json {...} ```).
    const cleanedResponse = responseText.replace(/```json|\n```/g, '').trim();

    // Parse the raw response text as JSON
    const parsedData = JSON.parse(cleanedResponse);

    // Extract the relevant fields (assuming they are present in all responses)
    const optimizedText = parsedData.optimizedResume || {};
    const atsScore = parsedData.ATSCompatibilityScore || "N/A";
    const explanation = parsedData.explanation || "Explanation not available.";
    const recomendedFileName = parsedData.recomendedFileName || "optimized_resume.docx";

    return {
        optimizedResume: optimizedText,
        ATSCompatibilityScore: atsScore,
        explanation: explanation,
        recomendedFileName: recomendedFileName
    };
}

const MODELS = [
    'gemini-3.5-flash',
    'gemini-3.1-pro',
    'gemini-3.1-flash-lite',
    'gemini-3-flash',
    'gemini-3-pro',
    'gemini-3-deep-think',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it',
    'gemma-2-27b-it',
    'gemma-2-9b-it',
    'gemma-2-2b-it'
];

async function callGeminiWithFallback(prompt, apiToken) {
    let lastError = null;

    for (const model of MODELS) {
        console.log(`[AI-CV] 🚀 Attempting generation with model: ${model}`);
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiToken}`;
            console.log(`[AI-CV] API URL: ${url.replace(apiToken, 'HIDDEN')}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json"
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ]
                }),
            });

            console.log(`[AI-CV] Model ${model} HTTP status: ${response.status}`);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const msg = errData?.error?.message || `HTTP ${response.status}`;
                console.warn(`[AI-CV] ❌ Model ${model} failed: ${msg}`, errData);
                lastError = new Error(msg);
                continue; // Try next model
            }

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts[0]?.text;

            if (!rawText) {
                console.warn(`[AI-CV] ⚠️ Model ${model} returned empty response or blocked by safety. Data:`, data);
                lastError = new Error('Empty response or content blocked');
                continue;
            }

            console.log(`[AI-CV] ✅ Model ${model} successful raw response:`, rawText);
            return rawText;
        } catch (err) {
            console.error(`[AI-CV] 🔥 Unexpected error with model ${model}:`, err.message, err);
            lastError = err;
        }
    }

    console.error('[AI-CV] 💀 All fallback models failed.');
    throw lastError || new Error('All fallback models failed');
}

async function optimizeResumeWithGemini(resumeText, jobDescription, apiToken) {
    console.log('[AI-CV] optimizeResumeWithGemini starting...');
    const prompt = getPrompt(resumeText, jobDescription);
    const rawResponse = await callGeminiWithFallback(prompt, apiToken);
    
    try {
        const parsed = parseResponse(rawResponse);
        console.log('[AI-CV] Resume optimization parsed successfully:', parsed);
        return parsed;
    } catch (err) {
        console.error('[AI-CV] Failed to parse optimized resume JSON:', err, 'Raw response:', rawResponse);
        throw new Error('Failed to parse AI response. Check logs.');
    }
}

async function generateCoverLetterWithGemini(resumeText, jobDescription, apiToken) {
    console.log('[AI-CV] generateCoverLetterWithGemini starting...');
    const prompt = getCoverLetterPrompt(resumeText, jobDescription);
    const rawResponse = await callGeminiWithFallback(prompt, apiToken);
    
    try {
        const cleaned = rawResponse.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        console.log('[AI-CV] Cover letter parsed successfully:', parsed);
        return parsed;
    } catch (err) {
        console.error('[AI-CV] Failed to parse cover letter JSON:', err, 'Raw response:', rawResponse);
        throw new Error('Failed to parse AI response. Check logs.');
    }
}

let savedJobDescription = '';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'optimizeResume') {
        const apiToken = message.apiToken || message.ai?.token || message.token;
        optimizeResumeWithGemini(message.resume, message.jobDescription, apiToken)
            .then(sendResponse)
            .catch(err => sendResponse({ error: err.message }));
        return true;
    }

    if (message.action === 'generateCoverLetter') {
        const apiToken = message.apiToken || message.ai?.token || message.token;
        generateCoverLetterWithGemini(message.resume, message.jobDescription, apiToken)
            .then(sendResponse)
            .catch(err => sendResponse({ error: err.message }));
        return true;
    }

    if (message.action === 'saveJobDescription') {
        savedJobDescription = message.jobDescription;
        sendResponse({ success: true });
    }

    if (message.action === 'getJobDescription') {
        sendResponse({ jobDescription: savedJobDescription });
    }

    return true;
});
