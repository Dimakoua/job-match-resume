async function optimizeResumeWithGemini(resumeText, jobDescription, APItoken) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APItoken}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": `Optimize this resume to match the given job description for ATS while keeping the same format, structure, and style of the original resume.\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}` }]
                }]
            })
        });

        const data = await response.json();
        console.log("Gemini API Response:", data?.candidates?.[0]?.content?.parts[0]?.text);
        return { optimizedResume: data?.candidates?.[0]?.content?.parts[0]?.text || "Error optimizing resume with Gemini." };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return { optimizedResume: "Error with Gemini." };
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
                    { role: "user", content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}` }
                ]
            })
        });

        const data = await response.json();
        return { optimizedResume: data?.choices?.[0]?.message?.content || "Error optimizing resume with GPT." };
    } catch (error) {
        console.error("GPT API Error:", error);
        return { optimizedResume: "Error with GPT." };
    }
}
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
                    { role: "user", content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}` }
                ]
            })
        });

        const data = await response.json();
        return { optimizedResume: data?.completion || "Error optimizing resume with Claude." };
    } catch (error) {
        console.error("Claude API Error:", error);
        return { optimizedResume: "Error with Claude." };
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
        .then((optimizedResume) => {
            sendResponse({ optimizedText: optimizedResume });
        }).catch(_error => {
            sendResponse({ optimizedText: "Error optimizing resume." });
        });
    }

    return true;
});


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
