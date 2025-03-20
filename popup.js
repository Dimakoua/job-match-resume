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
    document.getElementById('resume').value = content;
}

// Parse PDF using pdf.js
function parsePDF(pdfData) {
    pdfjsLib.getDocument(pdfData).promise.then(pdfDoc_ => {
        let textContent = "";
        const totalPages = pdfDoc_.numPages;

        // Loop through each page of the PDF
        for (let i = 1; i <= totalPages; i++) {
            pdfDoc_.getPage(i).then(page => {
                page.getTextContent().then(text => {
                    text.items.forEach(item => {
                        textContent += item.str + " ";
                    });

                    // When all pages are processed, display the parsed content
                    if (i === totalPages) {
                        document.getElementById('resume').value = textContent;
                    }
                });
            });
        }
    }).catch(error => {
        console.error("Error parsing PDF:", error);
    });
}

// Parse DOCX using Mammoth.js
function parseDOCX(arrayBuffer) {
    mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then(result => {
            document.getElementById('resume').value = result.value;
        })
        .catch(err => {
            console.error("Error parsing DOCX file:", err);
        });
}

function loadJobDescription() {
    chrome.runtime.sendMessage({ action: "getJobDescription" }, function (response) {
        console.log("Job Description:", response.jobDescription);
        const jobDescription = response.jobDescription;
        document.getElementById('jobDescription').value = jobDescription;
    });
}

function generateDocx() {
    const { Document, Packer, Paragraph, TextRun, Tab } = window.docx;

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun("Hello World"),
                            new TextRun({
                                text: "Foo Bar",
                                bold: true,
                                size: 40,
                            }),
                            new TextRun({
                                children: [new Tab(), "Github is the best"],
                                bold: true,
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    // Convert the document to a blob
    Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "generated_document.docx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Event listener for Save button
document.addEventListener('DOMContentLoaded', function () {
    // Load saved settings on page load
    loadSettings();
    loadJobDescription();

    const saveAISettingsBtn = document.getElementById('saveAISettings');
    const showAISettingsForm = document.getElementById('showAISettingsForm');
    const optimizeResumeBtn = document.getElementById('optimizeResume');
    const getJobDescriptionBtn = document.getElementById('getJobDescription');
    const generateDocxBtn = document.getElementById('generateDocx');
    const resumeFileInput = document.getElementById('resumeFile');

    // Save settings when the save button is clicked
    saveAISettingsBtn.addEventListener('click', function () {
        saveSettings();
    });

    // Save settings when the save button is clicked
    showAISettingsForm.addEventListener('click', function () {
        const AISettingsForm = document.getElementById('AISettingsForm');
        AISettingsForm.classList.toggle('hidden');
    });

    optimizeResumeBtn.addEventListener('click', optimizeResume);
    getJobDescriptionBtn.addEventListener('click', getJobDescription);
    resumeFileInput.addEventListener('change', handleFileUpload);

    generateDocxBtn.addEventListener("click", () => {
        generateDocx();
    });
});
