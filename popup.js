// Function to load saved settings from localStorage
function loadSettings() {
    const aiModelSelect = document.getElementById('aiModel');
    const userTokenInput = document.getElementById('userToken');

    const savedAiModel = localStorage.getItem('aiModel');
    const savedUserToken = localStorage.getItem('userToken');

    if (savedAiModel) {
        aiModelSelect.value = savedAiModel;
    }
    if (savedUserToken) {
        userTokenInput.value = savedUserToken;
    }

    if (savedAiModel && savedUserToken) {
        // Hide the form if both settings are saved
        const AISettingsForm = document.getElementById('AISettingsForm');
        AISettingsForm.classList.add('hidden');
    }

    return { aiModel: savedAiModel, userToken: savedUserToken };
}

// Function to save settings to localStorage
function saveSettings() {
    const aiModelSelect = document.getElementById('aiModel');
    const userTokenInput = document.getElementById('userToken');
    const AISettingsForm = document.getElementById('AISettingsForm');

    const aiModel = aiModelSelect.value;
    const userToken = userTokenInput.value;

    if (!aiModel || !userToken) {
        showMessage('error', 'Please fill in all fields.', 3000);
        return;
    }

    // Store settings in localStorage
    localStorage.setItem('aiModel', aiModel);
    localStorage.setItem('userToken', userToken);

    // Show success message and hide the form
    AISettingsForm.classList.add('hidden');
    showMessage('success', 'AI Settings Saved Successfully!', 3000);
}

function tryParseJobDescription() {
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getJobDescription' }, function (response) {
                console.log(response)
                if (response && response.jobDescription) {
                    // parsedJobDescription.textContent = response.jobDescription;
                } else {
                    // parsedJobDescription.textContent = 'Could not find job description.';
                }
            });
        });
    } catch (error) {
        console.log("Error parsing job description:", error);
    }
}

function showMessage(type, text, timeout = 3000) {
    let messageDiv = document.getElementById('messageBox');

    if (!messageBox) {
        console.error("Message box container not found!");
        return;
    }

    const randomId = 'msg-' + Math.random().toString(36).substr(2, 9);

    // Create a new message div
    messageDiv = document.createElement('div');
    messageDiv.id = randomId;
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = text;

    messageBox.appendChild(messageDiv);

    // Remove the message after timeout
    setTimeout(() => {
        messageDiv.classList.add('fade-out'); // Optional: Add fade-out animation
        setTimeout(() => messageDiv.remove(), 500); // Allow time for animation before removing
    }, timeout);
}

async function optimizeResume() {
    const settings = loadSettings();

    const resumeInput = document.getElementById("resume");
    const jobDescriptionInput = document.getElementById("jobDescription");
    const optimizedResumeDiv = document.getElementById("optimizedResume");

    const resumeText = resumeInput.value.trim();
    const jobDescriptionText = jobDescriptionInput.value.trim();

    if (!resumeText || !jobDescriptionText) {
        alert("Please enter both your resume and job description.");
        return;
    }

    // Send message to background.js
    const res = await chrome.runtime.sendMessage(
        {
            action: "optimizeResume",
            resume: resumeText,
            jobDescription: jobDescriptionText,
            ai: {
                model: settings.aiModel,
                token: settings.userToken,
            }
        }
    );

    console.log("Optimized Resume 22:", res);
}
// Event listener for Save button
document.addEventListener('DOMContentLoaded', function () {
    // Load saved settings on page load
    loadSettings();
    // tryParseJobDescription();

    const saveAISettingsBtn = document.getElementById('saveAISettings');
    const showAISettingsForm = document.getElementById('showAISettingsForm');
    const optimizeResumeBtn = document.getElementById('optimizeResume');

    // Save settings when the save button is clicked
    saveAISettingsBtn.addEventListener('click', function () {
        saveSettings();
    });

    // Save settings when the save button is clicked
    showAISettingsForm.addEventListener('click', function () {
        const AISettingsForm = document.getElementById('AISettingsForm');
        AISettingsForm.classList.toggle('hidden');
    });

    optimizeResumeBtn.addEventListener('click', function () {
        optimizeResume();
    });
});
