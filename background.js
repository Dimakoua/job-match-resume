chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Resume Optimizer Extension Installed.");
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("Message received in background.js:", message);

    if (message.action === "parseResume") {
        const resumeContent = message.fileContent;
        const jobDescription = message.jobDescription; // Assuming jobDescription is also sent in the message

        try {
            console.log("resumeContent", resumeContent);
            console.log("jobDescription", jobDescription);

            // Simulate the optimization process here (replace with real AI API)
            const optimizedResume = await optimizeResumeWithAI(resumeContent, jobDescription);

            console.log("optimizedResume", optimizedResume);

            sendResponse({ optimizedText: optimizedResume });
        } catch (error) {
            console.error(error);
            sendResponse({ optimizedText: "Error optimizing resume." });
        }
    }
});

async function optimizeResumeWithAI(resumeText, jobDescription) {
    try {
        // Ask Gemini to retain the format of the resume while optimizing it for ATS
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDoF3CYLcqU4xsxkk0iXXAk0ORz6EohkBg", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": `Optimize this resume to match the given job description for ATS while keeping the same format, structure, and style of the original resume.\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}`, }]
                }]
            })
        });

        console.log("response", response);

        const data = await response.json();

        console.log("data", data);

        if (data && data.candidates && data.candidates.length > 0) {
            console.log("data.candidates[0].output", data.candidates[0].output);

            return data.candidates[0].output; // Optimized resume, same format
        } else {
            console.log("data", data);

            throw new Error("Invalid AI response.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Error occurred while optimizing the resume.";
    }
}
