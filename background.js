const prompt = `
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

function getPrompt(resumeText, jobDescription) {
    return prompt.replace("{{resumeText}}", resumeText).replace("{{jobDescription}}", jobDescription);
}

// Generic function to parse AI response
function parseResponse(responseText) {
    try {
        // Remove any leading or trailing backticks or markdown formatting (like ```json {...} ```).
        const cleanedResponse = responseText.replace(/```json|\n```/g, '').trim();
        
        // Parse the raw response text as JSON
        const parsedData = JSON.parse(cleanedResponse);

        console.log(parsedData);

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
    } catch (error) {
        console.error("Error parsing response text as JSON:", error);
        return {
            optimizedResume: {},
            ATSCompatibilityScore: "N/A",
            explanation: "Error in explanation parsing.",
            recomendedFileName: "optimized_resume.docx",
        };
    }
}

async function optimizeResumeWithGemini(resumeText, jobDescription, APItoken) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APItoken}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{
                        "text": getPrompt(resumeText, jobDescription)
                    }]
                }]
            })
        });

        const data = await response.json();
        // Extracting the JSON text from the response
        const rawResponseText = data?.candidates?.[0]?.content?.parts[0]?.text;

        if (rawResponseText) {
            return parseResponse(rawResponseText);
        }

        return {
            optimizedResume: "Error: No response text found.",
            ATSCompatibilityScore: "N/A",
            explanation: "No explanation available."
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            optimizedResume: "Error with Gemini.",
            ATSCompatibilityScore: "N/A",
            explanation: "An error occurred while fetching the optimized resume."
        };
    }
}

async function optimizeResumeWithGPT(resumeText, jobDescription, APItoken) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${APItoken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: "Optimize the resume for ATS compatibility based on the job description while retaining its original format." },
                    { role: "user", content: getPrompt(resumeText, jobDescription) }
                ]
            })
        });

        const data = await response.json();
        // Extract the raw response text from the GPT API response
        const rawResponseText = data?.choices?.[0]?.message?.content;

        if (rawResponseText) {
            return parseResponse(rawResponseText);
        }

        return {
            optimizedResume: "Error: No response text found.",
            ATSCompatibilityScore: "N/A",
            explanation: "No explanation available."
        };
    } catch (error) {
        console.error("GPT API Error:", error);
        return {
            optimizedResume: "Error with GPT.",
            ATSCompatibilityScore: "N/A",
            explanation: "An error occurred while fetching the optimized resume."
        };
    }
}

// Function to optimize resume with Claude
async function optimizeResumeWithClaude(resumeText, jobDescription, APItoken) {
    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": APItoken,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-3",
                max_tokens: 1024,
                messages: [
                    { role: "system", content: "Optimize the resume for ATS compatibility while keeping its format intact." },
                    { role: "user", content: getPrompt(resumeText, jobDescription) }
                ]
            })
        });

        const data = await response.json();
        // Assuming the response structure is similar to other models, extract the raw response text
        const rawResponseText = data?.completion;

        if (rawResponseText) {
            // Parse the response using the generic parser
            return parseResponse(rawResponseText);
        }
        return {
            optimizedResume: "Error: No response text found.",
            ATSCompatibilityScore: "N/A",
            explanation: "No explanation available."
        };
    } catch (error) {
        console.error("Claude API Error:", error);
        return {
            optimizedResume: "Error with Claude.",
            ATSCompatibilityScore: "N/A",
            explanation: "An error occurred while fetching the optimized resume."
        };
    }
}


async function optimizeResumeWithAI(resumeText, jobDescription, ai) {
    try {
        switch (ai.model) {
            case "gpt":
                return await optimizeResumeWithGPT(resumeText, jobDescription, ai.token);
            case "gemini":
                return await optimizeResumeWithGemini(resumeText, jobDescription, ai.token);
            case "claud":
                return await optimizeResumeWithClaude(resumeText, jobDescription, ai.token);
            default:
                throw new Error("Invalid AI model selected.");
        }
    } catch (error) {
        console.error("Error during resume optimization:", error);
        return "Error optimizing resume with the selected AI model.";
    }
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Resume Optimizer Extension Installed.");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "optimizeResume") {
        const resumeContent = message.resume;
        const jobDescription = message.jobDescription;
        const ai = message.ai;

        // Call the function to optimize the resume with the selected AI model
        optimizeResumeWithAI(resumeContent, jobDescription, ai)
            .then((response) => {
                sendResponse(response);
            }).catch(_error => {
                sendResponse(_error);
            });
    }

    if (message.action === "saveJobDescription") {
        chrome.storage.session.set({ savedJobDescription: message.jobDescription });
    }

    if (message.action === "getJobDescription") {
        chrome.storage.session.get(["savedJobDescription"], (result) => {
            console.log(result.savedJobDescription);
            sendResponse({ jobDescription: result.savedJobDescription });
        });
    }

    return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        });
    }
});
