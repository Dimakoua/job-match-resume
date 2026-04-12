// ── Welcome Wizard ────────────────────────────────────────────

const WIZARD_SEEN_KEY = 'wizardSeen';

function isWizardSeen() {
    return localStorage.getItem(WIZARD_SEEN_KEY) === '1';
}

function markWizardSeen() {
    localStorage.setItem(WIZARD_SEEN_KEY, '1');
}

/** Show the wizard screen, hiding the rest of the shell. */
function showWizard() {
    document.getElementById('welcomeWizard').classList.remove('hidden');
    document.getElementById('mainHeader').classList.add('hidden');
    document.getElementById('AISettingsForm').classList.add('hidden');
    document.getElementById('tabNav').classList.add('hidden');
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
}

/** Dismiss wizard and reveal the main shell. */
function dismissWizard(targetTab) {
    markWizardSeen();
    document.getElementById('welcomeWizard').classList.add('hidden');
    document.getElementById('mainHeader').classList.remove('hidden');
    document.getElementById('tabNav').classList.remove('hidden');
    switchTab(targetTab);
}

// ── Config ────────────────────────────────────────────────────
// const API_BASE_URL = 'https://your-backend-url.com'; // update with actual backend URL
const API_BASE_URL = 'http://localhost:8787';

// Holds the last AI result so the download button can use it
let lastOptimizationResult = null;

// ── Settings ──────────────────────────────────────────────────

function loadSettings() {
    const savedAiModel  = localStorage.getItem('aiModel');
    const savedUserToken = localStorage.getItem('userToken');

    if (savedAiModel)   document.getElementById('aiModel').value     = savedAiModel;
    if (savedUserToken) document.getElementById('userToken').value   = savedUserToken;

    return { aiModel: savedAiModel, userToken: savedUserToken };
}

function saveSettings() {
    const aiModel   = document.getElementById('aiModel').value;
    const userToken = document.getElementById('userToken').value;

    if (!aiModel || !userToken) {
        showMessage('error', 'Please select a model and enter your API key.');
        return;
    }

    localStorage.setItem('aiModel',    aiModel);
    localStorage.setItem('userToken',  userToken);
    showMessage('success', 'Settings saved!');
    hideAISettings();
}

// ── AI Settings panel toggle ──────────────────────────────────

function showAISettings() {
    document.getElementById('AISettingsForm').classList.remove('hidden');
    document.getElementById('showAISettingsForm').classList.add('active');
    document.getElementById('tabNav').classList.add('hidden');
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
}

function hideAISettings() {
    document.getElementById('AISettingsForm').classList.add('hidden');
    document.getElementById('showAISettingsForm').classList.remove('active');
    document.getElementById('tabNav').classList.remove('hidden');
    // Restore the active tab
    const active = document.querySelector('.tab-btn.active');
    const tabName = active ? active.dataset.tab : 'optimize';
    document.getElementById('tab-' + tabName).classList.remove('hidden');
}

function toggleAISettings() {
    const panel = document.getElementById('AISettingsForm');
    panel.classList.contains('hidden') ? showAISettings() : hideAISettings();
}

// ── Tab management ────────────────────────────────────────────

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + tabName).classList.remove('hidden');

    // Close settings panel if open
    document.getElementById('AISettingsForm').classList.add('hidden');
    document.getElementById('showAISettingsForm').classList.remove('active');
    document.getElementById('tabNav').classList.remove('hidden');

    if (tabName === 'jobs') refreshJobsTab();
}

// ── Jobs tab state ────────────────────────────────────────────

function refreshJobsTab() {
    chrome.storage.local.get(['userToken', 'userProfile'], ({ userToken, userProfile }) => {
        const prompt = document.getElementById('jobSaveLoginPrompt');
        const fields = document.getElementById('jobSaveFields');
        if (userToken && userProfile) {
            prompt.classList.add('hidden');
            fields.classList.remove('hidden');
        } else {
            prompt.classList.remove('hidden');
            fields.classList.add('hidden');
        }
    });
}

// ── Resume optimization ───────────────────────────────────────

function loadCV() {
    const saved = localStorage.getItem('parsedResume');
    if (saved) document.getElementById('resume').value = saved;
}

function loadJobDescription() {
    chrome.runtime.sendMessage({ action: 'getJobDescription' }, function (response) {
        if (response && response.jobDescription &&
            response.jobDescription !== 'Job description not found.') {
            document.getElementById('jobDescription').value = response.jobDescription;
        }
    });
}

async function optimizeResume() {
    const settings = loadSettings();

    if (!settings.aiModel || !settings.userToken) {
        showMessage('error', 'Configure your AI API key in Settings first.');
        showAISettings();
        return;
    }

    const resumeText      = document.getElementById('resume').value.trim();
    const jobDescription  = document.getElementById('jobDescription').value.trim();

    if (!resumeText || !jobDescription) {
        showMessage('error', 'Please provide both your resume and a job description.');
        return;
    }

    try {
        toggleLoader(true);
        const result = await chrome.runtime.sendMessage({
            action:         'optimizeResume',
            resume:         resumeText,
            jobDescription: jobDescription,
            ai: { model: settings.aiModel, token: settings.userToken },
        });

        showATSResult(result);
    } catch (_err) {
        showMessage('error', 'An error occurred while optimizing the resume.');
    } finally {
        toggleLoader(false);
    }
}

function toggleLoader(show) {
    document.getElementById('loader').classList.toggle('hidden', !show);
    document.getElementById('optimizeResume').classList.toggle('hidden',  show);
}

// ── File parsing ──────────────────────────────────────────────

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const type = file.type;
    const reader = new FileReader();

    if (type === 'text/plain') {
        reader.onload = e => updateResumeContent(e.target.result);
        reader.readAsText(file);
    } else if (type === 'application/pdf') {
        reader.onload = e => parsePDF(new Uint8Array(e.target.result));
        reader.readAsArrayBuffer(file);
    } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.onload = e => parseDOCX(e.target.result);
        reader.readAsArrayBuffer(file);
    }
}

async function parsePDF(pdfData) {
    try {
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const pages  = [];
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            pages.push(pdfDoc.getPage(i).then(async page => {
                const txt = await page.getTextContent();
                return txt.items.map(item => item.str).join(' ');
            }));
        }
        updateResumeContent((await Promise.all(pages)).join('\n'));
    } catch (err) {
        console.error('PDF parse error:', err);
    }
}

function parseDOCX(arrayBuffer) {
    mammoth.extractRawText({ arrayBuffer })
        .then(r => updateResumeContent(r.value))
        .catch(err => console.error('DOCX parse error:', err));
}

function updateResumeContent(content) {
    document.getElementById('resume').value = content;
    localStorage.setItem('parsedResume', content);
}

// ── ATS score display ─────────────────────────────────────────

function showATSResult(result) {
    lastOptimizationResult = result;

    document.getElementById('optimizeForm').classList.add('hidden');
    document.getElementById('atsResult').classList.remove('hidden');

    setATSScore(result.ATSCompatibilityScore || 0);
    document.getElementById('atsExplanation').textContent =
        result.explanation || '';
}

function hideATSResult() {
    document.getElementById('atsResult').classList.add('hidden');
    document.getElementById('optimizeForm').classList.remove('hidden');
}

function setATSScore(percent) {
    const circle       = document.querySelector('.progress-circle');
    const text         = document.querySelector('.progress-text');
    const circumference = 2 * Math.PI * 50;
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    text.textContent = `${percent}/100`;
}

function downloadOptimizedResume() {
    if (!lastOptimizationResult) return;
    const doc = generateResume(lastOptimizationResult.optimizedResume);
    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = lastOptimizationResult.recomendedFileName || 'optimized_resume.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// ── Auth ──────────────────────────────────────────────────────

async function checkLoginStatus() {
    const { userToken, userProfile } =
        await chrome.storage.local.get(['userToken', 'userProfile']);
    if (userToken && userProfile) {
        showUserProfile(userProfile);
        return true;
    }
    return false;
}

function showUserProfile(profile) {
    document.getElementById('userProfile').classList.remove('hidden');
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('signupSection').classList.add('hidden');
    document.getElementById('userName').textContent = profile.name;
}

function toggleSignup(showSignup) {
    document.getElementById('loginSection').classList.toggle('hidden',  showSignup);
    document.getElementById('signupSection').classList.toggle('hidden', !showSignup);
}

async function handleLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('error', 'Please fill in all fields.');
        return;
    }

    try {
        const res  = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success) {
            await chrome.storage.local.set({
                userToken:   data.data.token,
                userProfile: data.data.user,
            });
            showUserProfile(data.data.user);
            refreshJobsTab();
            showMessage('success', 'Logged in successfully!');
        } else {
            showMessage('error', data.message || 'Login failed.');
        }
    } catch (_) {
        showMessage('error', 'Network error. Please try again.');
    }
}

async function handleSignup() {
    const name     = document.getElementById('signupName').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
        showMessage('error', 'Please fill in all fields.');
        return;
    }

    try {
        const res  = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (data.success) {
            showMessage('success', 'Account created! Please log in.');
            toggleSignup(false);
        } else {
            showMessage('error', data.message || 'Signup failed.');
        }
    } catch (_) {
        showMessage('error', 'Network error. Please try again.');
    }
}

async function handleLogout() {
    await chrome.storage.local.remove(['userToken', 'userProfile']);
    document.getElementById('userProfile').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
    refreshJobsTab();
    showMessage('success', 'Logged out successfully!');
}

// ── Google Sign-In ────────────────────────────────────────────

const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';

function initializeGoogleSignIn() {
    const container = document.getElementById('googleSignInBtn');
    if (!container) return;
    container.innerHTML = '<button class="google-signin-button" id="googleSignInButton">'
        + '<span class="google-icon">G</span> Continue with Google</button>';
    document.getElementById('googleSignInButton')
        .addEventListener('click', handleGoogleSignIn);
}

async function handleGoogleSignIn() {
    try {
        const redirectURL = chrome.identity.getRedirectURL();
        const authURL = 'https://accounts.google.com/o/oauth2/auth?'
            + `client_id=${GOOGLE_CLIENT_ID}&`
            + `response_type=id_token&`
            + `redirect_uri=${encodeURIComponent(redirectURL)}&`
            + `scope=${encodeURIComponent('openid email profile')}&`
            + `nonce=${Math.random().toString(36).substring(2)}`;

        const responseUrl = await chrome.identity.launchWebAuthFlow(
            { url: authURL, interactive: true }
        );

        if (!responseUrl) {
            showMessage('error', 'Google sign-in was cancelled.');
            return;
        }

        const idToken = new URL(responseUrl).hash.substring(1)
            .split('&')
            .find(p => p.startsWith('id_token='))
            ?.split('=')[1];

        if (!idToken) {
            showMessage('error', 'Failed to obtain access token.');
            return;
        }

        const res  = await fetch(`${API_BASE_URL}/api/auth/google/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ idToken }),
        });
        const data = await res.json();

        if (data.success) {
            await chrome.storage.local.set({
                userToken:   data.data.token,
                userProfile: data.data.user,
            });
            showUserProfile(data.data.user);
            refreshJobsTab();
            showMessage('success', 'Logged in with Google!');
        } else {
            showMessage('error', data.message || 'Google login failed.');
        }
    } catch (err) {
        console.error('Google sign-in error:', err);
        showMessage('error', 'Google sign-in failed. Please try again.');
    }
}

// ── Job saving ────────────────────────────────────────────────

function extractJobDetails(jobDescription) {
    const lines    = jobDescription.split('\n');
    let company    = '';
    let position   = '';

    for (const line of lines.slice(0, 10)) {
        if (!company  && (line.toLowerCase().includes('company') || line.toLowerCase().includes(' at ')))
            company  = line.replace(/company[:\s]*/i, '').trim();
        if (!position && (line.toLowerCase().includes('position') || line.toLowerCase().includes('job title')))
            position = line.replace(/position[:\s]*/i, '').replace(/job title[:\s]*/i, '').trim();
    }

    return { company, position };
}

async function saveJob() {
    const company     = document.getElementById('jobCompany').value.trim();
    const position    = document.getElementById('jobPosition').value.trim();
    const url         = document.getElementById('jobUrl').value.trim();
    const jd          = document.getElementById('jobDescriptionSave').value.trim();

    if (!company || !position || !jd) {
        showMessage('error', 'Company, position, and job description are required.');
        return;
    }

    try {
        const { userToken } = await chrome.storage.local.get(['userToken']);

        const res  = await fetch(`${API_BASE_URL}/api/job-applications/from-extension`, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                company,
                position,
                jobDescription: jd,
                url: url || undefined,
            }),
        });
        const data = await res.json();

        if (data.success) {
            showMessage('success', 'Job saved to your applications!');
            document.getElementById('jobCompany').value        = '';
            document.getElementById('jobPosition').value       = '';
            document.getElementById('jobUrl').value            = '';
            document.getElementById('jobDescriptionSave').value = '';
            document.getElementById('jdDetectedBanner').classList.add('hidden');
        } else {
            showMessage('error', data.message || 'Failed to save job.');
        }
    } catch (_) {
        showMessage('error', 'Network error. Please try again.');
    }
}

// ── Detected JD from floating card ───────────────────────────

async function checkForDetectedJD() {
    try {
        const result = await chrome.storage.session.get(
            ['jobDescriptionForSave', 'detectedJobTitle']
        );

        if (!result.jobDescriptionForSave) return false;

        await chrome.storage.session.remove(['jobDescriptionForSave', 'detectedJobTitle']);

        // Pre-fill the job save form
        document.getElementById('jobDescriptionSave').value = result.jobDescriptionForSave;

        const extracted = extractJobDetails(result.jobDescriptionForSave);
        if (extracted.company)  document.getElementById('jobCompany').value  = extracted.company;
        if (extracted.position) document.getElementById('jobPosition').value = extracted.position;

        // Show the detected banner
        const subtitle = result.detectedJobTitle || 'from current page';
        document.getElementById('detectedJobTitle').textContent = subtitle;
        document.getElementById('jdDetectedBanner').classList.remove('hidden');

        // Switch to the Jobs tab
        switchTab('jobs');
        return true;
    } catch (err) {
        console.error('checkForDetectedJD:', err);
        return false;
    }
}

// ── Toast messages ────────────────────────────────────────────

function showMessage(type, text, timeout = 3000) {
    const box = document.getElementById('messageBox');
    if (!box) return;

    const div = document.createElement('div');
    div.className = type === 'success' ? 'success-message' : 'error-message';
    div.textContent = text;
    box.appendChild(div);

    setTimeout(() => {
        div.classList.add('fade-out');
        setTimeout(() => div.remove(), 500);
    }, timeout);
}

// ── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function () {
    loadSettings();
    loadCV();
    loadJobDescription();

    await checkLoginStatus();
    initializeGoogleSignIn();
    refreshJobsTab();

    // If opened from the floating card, skip wizard and jump straight to Jobs tab
    const routedFromCard = await checkForDetectedJD();

    // Show wizard on first ever open, unless we were routed by the floating card
    if (!isWizardSeen() && !routedFromCard) {
        showWizard();
    }

    // ── Wizard buttons ─────────────────────────────────────────
    document.getElementById('wizardChooseAI').addEventListener('click', () => {
        dismissWizard('optimize');
        showAISettings();          // open AI settings right away
    });
    document.getElementById('wizardChooseLogin').addEventListener('click', () => {
        dismissWizard('account');
    });

    // ── Event bindings ─────────────────────────────────────────

    // Settings
    document.getElementById('showAISettingsForm').addEventListener('click', toggleAISettings);
    document.getElementById('saveAISettings').addEventListener('click', saveSettings);

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Optimize tab
    document.getElementById('optimizeResume').addEventListener('click', optimizeResume);
    document.getElementById('resumeFile').addEventListener('change', handleFileUpload);
    document.getElementById('backToOptimize').addEventListener('click', hideATSResult);
    document.getElementById('downloadResume').addEventListener('click', downloadOptimizedResume);

    // Jobs tab
    document.getElementById('saveJobBtn').addEventListener('click', saveJob);
    document.getElementById('goToAccountTab').addEventListener('click', () => switchTab('account'));
    document.getElementById('dismissDetectedJD').addEventListener('click', () => {
        document.getElementById('jdDetectedBanner').classList.add('hidden');
    });

    // Account tab
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('signupBtn').addEventListener('click', handleSignup);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('showSignupForm').addEventListener('click', e => {
        e.preventDefault(); toggleSignup(true);
    });
    document.getElementById('backToLogin').addEventListener('click', e => {
        e.preventDefault(); toggleSignup(false);
    });
});
