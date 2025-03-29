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

function setupView({ aiModel, userToken }) {
    if(!aiModel || !userToken) {
        toggleAISettings();
    }
}

function loadJobDescription() {
    chrome.runtime.sendMessage({ action: "getJobDescription" }, function (response) {
        const jobDescription = response.jobDescription;
        document.getElementById('jobDescription').value = jobDescription;
    });
}

function loadCV() {
    const parsedResume = localStorage.getItem('parsedResume');

    if (parsedResume) {
        document.getElementById('resume').value = parsedResume;
    }
}

function toggleAISettings() {
    const AISettingsForm = document.getElementById('AISettingsForm');
    const mainForm = document.getElementById('MainForm');
    const atsScore = document.getElementById('atsScore');

    AISettingsForm.classList.toggle('hidden');
    mainForm.classList.toggle('hidden');
    atsScore.classList.add('hidden');
}

function toggleATSResul() {
    const mainForm = document.getElementById('MainForm');
    const atsScore = document.getElementById('atsScore');
    const header = document.getElementById('header');
    const history = document.getElementById('history');

    mainForm.classList.toggle('hidden');
    atsScore.classList.toggle('hidden');
    header.classList.toggle('hidden');
    history.classList.toggle('hidden');
}

// Function to save settings to localStorage
function saveSettings() {
    const aiModelSelect = document.getElementById('aiModel');
    const userTokenInput = document.getElementById('userToken');

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
    showMessage('success', 'AI Settings Saved Successfully!', 3000);
    toggleAISettings();
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

    const resumeText = resumeInput.value.trim();
    const jobDescriptionText = jobDescriptionInput.value.trim();

    if (!resumeText || !jobDescriptionText) {
        alert("Please enter both your resume and job description.");
        return;
    }

    try {
        toggleLoader(true);

        // Send message to background.js
        const result = await chrome.runtime.sendMessage(
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

        generateDocx(result);
        displayATSScore(result.ATSCompatibilityScore,);
    } catch (error) {
        showMessage('error', 'An error occurred while optimizing the resume.', 3000);
    } finally {
        toggleLoader(false);
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];

    if (!file) {
        console.error("No file selected.");
        return;
    }

    const fileType = file.type;

    // For Text files
    if (fileType === "text/plain") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContent = e.target.result;
            parseResumeContent(fileContent);
        };
        reader.readAsText(file);
    }
    // For PDF files, use pdf.js to extract text
    else if (fileType === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const pdfData = new Uint8Array(e.target.result);
            parsePDF(pdfData);
        };
        reader.readAsArrayBuffer(file);
    }
    // For DOCX files, use Mammoth.js to extract text
    else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const arrayBuffer = e.target.result;
            parseDOCX(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    } else {
        console.log("Unsupported file type");
    }
}

// Parse Text file
function parseResumeContent(content) {
    updateResumeContent(content);
}

// Parse PDF using pdf.js
async function parsePDF(pdfData) {
    try {
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const totalPages = pdfDoc.numPages;

        let textContent = "";

        // Create an array of promises for each page
        const pagePromises = [];

        for (let i = 1; i <= totalPages; i++) {
            pagePromises.push(pdfDoc.getPage(i).then(async page => {
                const text = await page.getTextContent();
                return text.items.map(item => item.str).join(" "); // Convert items to text
            }));
        }

        // Wait for all pages to be processed
        const allText = await Promise.all(pagePromises);

        // Combine all pages' text
        textContent = allText.join("\n");

        updateResumeContent(textContent);
    } catch (error) {
        console.error("Error parsing PDF:", error);
    }
}


// Parse DOCX using Mammoth.js
function parseDOCX(arrayBuffer) {
    mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then(result => {
            updateResumeContent(result.value);
        })
        .catch(err => {
            console.error("Error parsing DOCX file:", err);
        });
}

function updateResumeContent(content) {
    const resumeInput = document.getElementById('resume');
    if (resumeInput) {
        resumeInput.value = content;
        localStorage.setItem('parsedResume', content);
    }
}

function generateDocx(jsonData) {
    const doc = generateResume(jsonData.optimizedResume)

    // Convert the document to a blob
    Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = jsonData.recomendedFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function setATSScore(percent) {
    const circle = document.querySelector(".progress-circle");
    const text = document.querySelector(".progress-text");
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    text.textContent = `${percent}/100`;
}

function displayATSScore(atsScore) {
    toggleATSResul();
    // Set the ATS score text
    setATSScore(atsScore);
}

function toggleLoader() {
    const loader = document.getElementById("loader");
    const optimizeResumeBtn = document.getElementById("optimizeResume");

    loader.classList.toggle("hidden");
    optimizeResumeBtn.classList.toggle("hidden");
}

// Event listener for Save button
document.addEventListener('DOMContentLoaded', function () {
    // Load saved settings on page load
    const settings = loadSettings();
    setupView(settings);
    loadCV();

    const saveAISettingsBtn = document.getElementById('saveAISettings');
    const showAISettingsForm = document.getElementById('showAISettingsForm');
    const optimizeResumeBtn = document.getElementById('optimizeResume');
    const resumeFileInput = document.getElementById('resumeFile');
    const history = document.getElementById('history');

    optimizeResumeBtn.addEventListener('click', optimizeResume);
    saveAISettingsBtn.addEventListener('click', saveSettings);
    resumeFileInput.addEventListener('change', handleFileUpload);
    showAISettingsForm.addEventListener('click', toggleAISettings);
    history.addEventListener('click', toggleATSResul);
});

loadJobDescription();