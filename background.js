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

async function optimizeResumeWithGemini(resumeText, jobDescription, APItoken) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APItoken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "contents": [{
                "parts": [{ "text": getPrompt(resumeText, jobDescription) }]
            }]
        })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const rawResponseText = data?.candidates?.[0]?.content?.parts[0]?.text;

    if (!rawResponseText) {
        throw new Error('No response text received from Gemini.');
    }

    return parseResponse(rawResponseText);
}

async function generateCoverLetterWithGemini(resumeText, jobDescription, apiToken) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: getCoverLetterPrompt(resumeText, jobDescription) }] }],
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts[0]?.text;

    if (!rawText) {
        throw new Error('No response text received from Gemini.');
    }

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
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
