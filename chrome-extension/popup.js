// API Configuration
const API_BASE_URL = 'https://your-backend-url.com'; // Update this with your actual backend URL
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
        showView(VIEWS.AI_SETTINGS);
    } else {
        showView(VIEWS.MAIN);
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

// Centralized view management
const VIEWS = {
    MAIN: 'MainForm',
    AI_SETTINGS: 'AISettingsForm',
    LOGIN: 'LoginForm',
    JOB_SAVE: 'JobSaveForm',
    ATS_SCORE: 'atsScore'
};

function showView(viewName) {
    // Hide all views
    Object.values(VIEWS).forEach(viewId => {
        document.getElementById(viewId).classList.add('hidden');
    });

    // Hide header elements that should only show in certain views
    const header = document.getElementById('header');
    const history = document.getElementById('history');
    
    if (viewName === VIEWS.ATS_SCORE) {
        header.classList.add('hidden');
        history.classList.remove('hidden');
    } else {
        header.classList.remove('hidden');
        history.classList.add('hidden');
    }

    // Show the requested view
    document.getElementById(viewName).classList.remove('hidden');
}

function toggleAISettings() {
    const aiSettingsForm = document.getElementById('AISettingsForm');
    
    if (aiSettingsForm.classList.contains('hidden')) {
        // Show AI settings
        showView(VIEWS.AI_SETTINGS);
    } else {
        // Go back to main form
        showView(VIEWS.MAIN);
    }
}

function toggleATSResul() {
    const atsScore = document.getElementById('atsScore');
    
    if (atsScore.classList.contains('hidden')) {
        // Show ATS score
        showView(VIEWS.ATS_SCORE);
    } else {
        // Go back to main form
        showView(VIEWS.MAIN);
    }
}

function toggleLoginForm() {
    const loginForm = document.getElementById('LoginForm');
    
    if (loginForm.classList.contains('hidden')) {
        // Show login form
        showView(VIEWS.LOGIN);
    } else {
        // Go back to main form
        showView(VIEWS.MAIN);
    }
}

// Function to save settings to localStorage
function saveSettings() {
    const aiModelSelect = document.getElementById('aiModel');
    const userTokenInput = document.getElementById('userToken');

    const aiModel = aiModelSelect.value;
    const userToken = userTokenInput.value;

    if (!aiModel || !userToken) {
        showMessage('error', 'Please fill in AI model and API key.', 3000);
        return;
    }

    // Store settings in localStorage
    localStorage.setItem('aiModel', aiModel);
    localStorage.setItem('userToken', userToken);

    // Show success message and hide the form
    showMessage('success', 'Settings Saved Successfully!', 3000);
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

// Login and User Management Functions
async function checkLoginStatus() {
    const { userToken } = await chrome.storage.local.get(['userToken']);
    const { userProfile } = await chrome.storage.local.get(['userProfile']);

    if (userToken && userProfile) {
        showUserProfile(userProfile);
        return true;
    }
    return false;
}

function showUserProfile(profile) {
    document.getElementById('userName').textContent = profile.name;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('signupSection').classList.add('hidden');
    document.getElementById('userProfile').classList.remove('hidden');
    document.getElementById('showLoginForm').textContent = 'account_circle';
    document.getElementById('showLoginForm').title = 'Profile';
}

function toggleLoginForm() {
    const loginForm = document.getElementById('LoginForm');
    const mainForm = document.getElementById('MainForm');
    const aiSettings = document.getElementById('AISettingsForm');
    const jobSaveForm = document.getElementById('JobSaveForm');
    const atsScore = document.getElementById('atsScore');

    // Hide other forms
    mainForm.classList.add('hidden');
    aiSettings.classList.add('hidden');
    jobSaveForm.classList.add('hidden');
    atsScore.classList.add('hidden');

    loginForm.classList.toggle('hidden');
}

function toggleSignup(showSignup) {
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');

    if (showSignup) {
        loginSection.classList.add('hidden');
        signupSection.classList.remove('hidden');
    } else {
        signupSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('error', 'Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
            await chrome.storage.local.set({
                userToken: data.data.token,
                userProfile: data.data.user,
            });
            showUserProfile(data.data.user);
            showMessage('success', 'Logged in successfully!');
            toggleLoginForm();
        } else {
            showMessage('error', data.message || 'Login failed.');
        }
    } catch (error) {
        showMessage('error', 'Network error. Please try again.');
    }
}

async function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
        showMessage('error', 'Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (data.success) {
            showMessage('success', 'Account created! Please log in.');
            toggleSignup(false);
        } else {
            showMessage('error', data.message || 'Signup failed.');
        }
    } catch (error) {
        showMessage('error', 'Network error. Please try again.');
    }
}

async function handleLogout() {
    await chrome.storage.local.remove(['userToken', 'userProfile']);
    document.getElementById('userProfile').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('showLoginForm').textContent = 'account_circle';
    document.getElementById('showLoginForm').title = 'Login';
    showMessage('success', 'Logged out successfully!');
}

// Google Sign-In Configuration
const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com'; // Replace with your actual Google Client ID for the extension

// Initialize Google Sign-In using Chrome Identity API
function initializeGoogleSignIn() {
    // Check if Google Sign-In button should be shown
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    if (googleSignInBtn) {
        googleSignInBtn.innerHTML = '<button class="google-signin-button" id="googleSignInButton"><span class="google-icon">G</span> Continue with Google</button>';
        document.getElementById('googleSignInButton').addEventListener('click', handleGoogleSignIn);
    }
}

// Handle Google Sign-In using Chrome Identity API
async function handleGoogleSignIn() {
    try {
        // Use Chrome Identity API for OAuth
        const redirectURL = chrome.identity.getRedirectURL();
        const clientId = GOOGLE_CLIENT_ID;
        
        const authURL = `https://accounts.google.com/o/oauth2/auth?` +
            `client_id=${clientId}&` +
            `response_type=id_token&` +
            `redirect_uri=${encodeURIComponent(redirectURL)}&` +
            `scope=${encodeURIComponent('openid email profile')}&` +
            `nonce=${Math.random().toString(36).substring(2)}`;

        const responseUrl = await chrome.identity.launchWebAuthFlow({
            url: authURL,
            interactive: true
        });

        if (responseUrl) {
            // Extract the id_token from the response URL
            const url = new URL(responseUrl);
            const idToken = url.hash.substring(1).split('&')
                .find(param => param.startsWith('id_token='))
                ?.split('=')[1];

            if (idToken) {
                // Send the ID token to our backend
                const result = await fetch(`${API_BASE_URL}/api/auth/google/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idToken: idToken,
                    }),
                });

                const data = await result.json();

                if (data.success) {
                    await chrome.storage.local.set({
                        userToken: data.data.token,
                        userProfile: data.data.user,
                    });
                    showUserProfile(data.data.user);
                    showMessage('success', 'Logged in with Google successfully!');
                    toggleLoginForm();
                } else {
                    showMessage('error', data.message || 'Google login failed.');
                }
            } else {
                showMessage('error', 'Failed to obtain access token.');
            }
        } else {
            showMessage('error', 'Google sign-in was cancelled.');
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        showMessage('error', 'Google sign-in failed. Please try again.');
    }
}

// Job Saving Functions
function showJobSaveForm() {
    const jobDescription = document.getElementById('jobDescription').value;
    document.getElementById('jobDescriptionSave').value = jobDescription;

    // Try to auto-extract company and position from job description
    const extracted = extractJobDetails(jobDescription);
    document.getElementById('jobCompany').value = extracted.company;
    document.getElementById('jobPosition').value = extracted.position;

    // Show job save form
    showView(VIEWS.JOB_SAVE);
}

function hideJobSaveForm() {
    showView(VIEWS.MAIN);
}

function extractJobDetails(jobDescription) {
    // Simple extraction logic - can be improved
    const lines = jobDescription.split('\n');
    let company = '';
    let position = '';

    for (const line of lines.slice(0, 10)) { // Check first 10 lines
        if (line.toLowerCase().includes('company') || line.toLowerCase().includes('at ')) {
            company = line.replace(/company[:\s]*/i, '').trim();
        }
        if (line.toLowerCase().includes('position') || line.toLowerCase().includes('job title')) {
            position = line.replace(/position[:\s]*/i, '').replace(/job title[:\s]*/i, '').trim();
        }
    }

    return { company, position };
}

async function saveJob() {
    const company = document.getElementById('jobCompany').value;
    const position = document.getElementById('jobPosition').value;
    const url = document.getElementById('jobUrl').value;
    const jobDescription = document.getElementById('jobDescriptionSave').value;

    if (!company || !position || !jobDescription) {
        showMessage('error', 'Please fill in company, position, and job description.');
        return;
    }

    try {
        const { userToken } = await chrome.storage.local.get(['userToken']);

        const response = await fetch(`${API_BASE_URL}/api/job-applications/from-extension`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                company,
                position,
                jobDescription,
                url: url || undefined,
            }),
        });

        const data = await response.json();

        if (data.success) {
            showMessage('success', 'Job saved to dashboard!');
            hideJobSaveForm();
        } else {
            showMessage('error', data.message || 'Failed to save job.');
        }
    } catch (error) {
        showMessage('error', 'Network error. Please try again.');
    }
}

// Check for pending job save from floating button
async function checkForPendingJobSave() {
    try {
        const result = await chrome.storage.session.get(['jobDescriptionForSave']);
        if (result.jobDescriptionForSave) {
            // Clear the stored job description
            await chrome.storage.session.remove(['jobDescriptionForSave']);
            
            // Check if user is logged in
            const isLoggedIn = await checkLoginStatus();
            if (isLoggedIn) {
                // Pre-fill and show job save form
                document.getElementById('jobDescriptionSave').value = result.jobDescriptionForSave;
                
                // Try to extract company and position
                const extracted = extractJobDetails(result.jobDescriptionForSave);
                document.getElementById('jobCompany').value = extracted.company;
                document.getElementById('jobPosition').value = extracted.position;
                
                // Show job save form
                showView(VIEWS.JOB_SAVE);
            } else {
                // Show login prompt
                showMessage('info', 'Please log in to save jobs to your dashboard.');
                showView(VIEWS.LOGIN);
            }
        }
    } catch (error) {
        console.error('Error checking for pending job save:', error);
    }
}

// Event listener for Save button
document.addEventListener('DOMContentLoaded', function () {
    // Load saved settings on page load
    const settings = loadSettings();
    setupView(settings);
    loadCV();
    checkLoginStatus(); // Check if user is logged in
    
    // Initialize Google Sign-In
    initializeGoogleSignIn();

    // Check if we should show job save form
    checkForPendingJobSave();

    const saveAISettingsBtn = document.getElementById('saveAISettings');
    const showAISettingsForm = document.getElementById('showAISettingsForm');
    const optimizeResumeBtn = document.getElementById('optimizeResume');
    const resumeFileInput = document.getElementById('resumeFile');
    const history = document.getElementById('history');

    // Login related
    const showLoginForm = document.getElementById('showLoginForm');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const showSignupForm = document.getElementById('showSignupForm');
    const backToLogin = document.getElementById('backToLogin');

    // Job saving related
    const saveJobBtn = document.getElementById('saveJobBtn');
    const cancelSaveJob = document.getElementById('cancelSaveJob');

    optimizeResumeBtn.addEventListener('click', optimizeResume);
    saveAISettingsBtn.addEventListener('click', saveSettings);
    resumeFileInput.addEventListener('change', handleFileUpload);
    showAISettingsForm.addEventListener('click', toggleAISettings);
    history.addEventListener('click', toggleATSResul);

    // Login events
    showLoginForm.addEventListener('click', toggleLoginForm);
    loginBtn.addEventListener('click', handleLogin);
    signupBtn.addEventListener('click', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    showSignupForm.addEventListener('click', () => toggleSignup(true));
    backToLogin.addEventListener('click', () => toggleSignup(false));

    // Job saving events
    saveJobBtn.addEventListener('click', saveJob);
    cancelSaveJob.addEventListener('click', hideJobSaveForm);
});

loadJobDescription();