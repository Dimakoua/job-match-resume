/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════════ */
const CIRCUMFERENCE = 2 * Math.PI * 42; // r=42 → ≈264

/* ═══════════════════════════════════════════════════════════════
   ONBOARDING
════════════════════════════════════════════════════════════════ */
let currentStep = 0;

function initOnboarding() {
    goToStep(0);
    document.getElementById('ob-next').addEventListener('click', onNextStep);
    document.getElementById('ob-back').addEventListener('click', onBackStep);
}

function goToStep(n) {
    currentStep = n;

    document.querySelectorAll('.ob-step').forEach((el, i) => {
        el.classList.toggle('active', i === n);
    });
    document.querySelectorAll('.ob-dot').forEach((el, i) => {
        el.classList.toggle('active', i === n);
    });

    document.getElementById('ob-back').classList.toggle('hidden', n === 0);
    document.getElementById('ob-next').textContent = n === 2 ? 'Save & Finish ✓' : 'Next →';
}

function onNextStep() {
    if (currentStep < 2) {
        goToStep(currentStep + 1);
    } else {
        finishOnboarding();
    }
}

function onBackStep() {
    if (currentStep > 0) goToStep(currentStep - 1);
}

function finishOnboarding() {
    const key = document.getElementById('ob-api-key').value.trim();
    if (!key) {
        showMessage('error', 'Please enter your Google AI API key.');
        return;
    }
    chrome.storage.local.set({ userToken: key, onboardingComplete: true }, () => {
        showMainView();
    });
}

/* ═══════════════════════════════════════════════════════════════
   VIEW SWITCHING
════════════════════════════════════════════════════════════════ */
function showOnboardingView() {
    document.getElementById('onboarding-view').classList.remove('hidden');
    document.getElementById('main-view').classList.add('hidden');
}

function showMainView() {
    document.getElementById('onboarding-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    initMainView();
}

/* ═══════════════════════════════════════════════════════════════
   MAIN VIEW INIT
════════════════════════════════════════════════════════════════ */
function initMainView() {
    chrome.storage.local.get(['userToken', 'parsedResume'], (data) => {
        const token = data.userToken;
        const savedCV = data.parsedResume;

        // Status dot
        const dot = document.getElementById('status-dot');
        dot.className = 'status-dot ' + (token ? 'ready' : 'setup');

        // Pre-fill settings input
        if (token) document.getElementById('api-key-input').value = token;

        // Pre-fill saved CV
        if (savedCV) {
            document.getElementById('resume-textarea').value = savedCV;
            // Load job description from background and compute score
            chrome.runtime.sendMessage({ action: 'getJobDescription' }, (response) => {
                if (response && response.jobDescription) {
                    document.getElementById('job-desc-textarea').value = response.jobDescription;
                    computeAndShowKeywordScore(savedCV, response.jobDescription);
                }
            });
        }
    });

    // Wire settings toggle
    document.getElementById('settings-toggle').addEventListener('click', toggleSettings);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('clear-data-btn').addEventListener('click', clearData);

    // Wire back button
    document.getElementById('back-btn').addEventListener('click', goBackToForm);

    // Wire file upload
    document.getElementById('resume-file').addEventListener('change', handleFileUpload);

    // Wire textarea change → keyword score
    document.getElementById('resume-textarea').addEventListener('input', onInputChange);
    document.getElementById('job-desc-textarea').addEventListener('input', onInputChange);

    // Wire action buttons
    document.getElementById('tailor-cv-btn').addEventListener('click', tailorCV);
    document.getElementById('cover-letter-btn').addEventListener('click', generateCoverLetter);

    // Wire result buttons
    document.getElementById('download-cv-btn').addEventListener('click', () => downloadCV(window._tailorResult));
    document.getElementById('download-cover-btn').addEventListener('click', () => downloadCoverLetter(window._coverResult));
    document.getElementById('copy-cover-btn').addEventListener('click', copyCoverLetter);
}

/* ─── Settings ─── */
function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('hidden');
}

function saveSettings() {
    const key = document.getElementById('api-key-input').value.trim();
    if (!key) { showMessage('error', 'API key cannot be empty.'); return; }
    chrome.storage.local.set({ userToken: key }, () => {
        const dot = document.getElementById('status-dot');
        dot.className = 'status-dot ready';
        document.getElementById('settings-panel').classList.add('hidden');
        showMessage('success', 'API key saved.');
    });
}

function clearData() {
    if (!confirm('Clear all stored data (CV, API key)?')) return;
    chrome.storage.local.remove(['userToken', 'parsedResume', 'onboardingComplete'], () => {
        document.getElementById('resume-textarea').value = '';
        document.getElementById('api-key-input').value = '';
        document.getElementById('status-dot').className = 'status-dot setup';
        document.getElementById('settings-panel').classList.add('hidden');
        document.getElementById('kw-panel').classList.add('hidden');
        showMessage('success', 'Data cleared.');
    });
}

/* ─── Job description ─── */
function loadJobDescription() {
    chrome.runtime.sendMessage({ action: 'getJobDescription' }, (response) => {
        if (response && response.jobDescription) {
            document.getElementById('job-desc-textarea').value = response.jobDescription;
            onInputChange();
        }
    });
}

/* ═══════════════════════════════════════════════════════════════
   KEYWORD SCORE
════════════════════════════════════════════════════════════════ */
function onInputChange() {
    const cv = document.getElementById('resume-textarea').value.trim();
    const jd = document.getElementById('job-desc-textarea').value.trim();
    if (cv && jd) computeAndShowKeywordScore(cv, jd);
    else document.getElementById('kw-panel').classList.add('hidden');
}

function computeAndShowKeywordScore(cv, jd) {
    if (!window.keywordMatcher) return;
    const { score, matched, missing } = window.keywordMatcher.scoreMatch(cv, jd);

    const panel = document.getElementById('kw-panel');
    const pctEl = document.getElementById('kw-pct');
    const barEl = document.getElementById('kw-bar-fill');
    const chipsEl = document.getElementById('kw-chips-row');

    pctEl.textContent = score + '%';
    pctEl.className = 'kw-pct ' + (score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low');
    barEl.style.width = score + '%';
    barEl.style.background = score >= 70 ? '#43a047' : score >= 40 ? '#e65100' : '#c62828';

    const topMatched = matched.slice(0, 6);
    const topMissing = missing.slice(0, 6);
    chipsEl.innerHTML =
        topMatched.map(w => `<span class="kw-chip matched">✓ ${w}</span>`).join('') +
        topMissing.map(w => `<span class="kw-chip missing">✗ ${w}</span>`).join('');

    panel.classList.remove('hidden');
}

/* ═══════════════════════════════════════════════════════════════
   FILE UPLOAD / PARSING
════════════════════════════════════════════════════════════════ */
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = ev => updateCV(ev.target.result);
        reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = ev => parsePDF(new Uint8Array(ev.target.result));
        reader.readAsArrayBuffer(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = ev => parseDOCX(ev.target.result);
        reader.readAsArrayBuffer(file);
    } else {
        showMessage('error', 'Unsupported file type. Use PDF, DOCX, or TXT.');
    }
}

async function parsePDF(pdfData) {
    try {
        const pdf = await pdfjsLib.getDocument(pdfData).promise;
        const pages = await Promise.all(
            Array.from({ length: pdf.numPages }, (_, i) =>
                pdf.getPage(i + 1).then(p => p.getTextContent()).then(tc => tc.items.map(x => x.str).join(' '))
            )
        );
        updateCV(pages.join('\n'));
    } catch (err) {
        showMessage('error', 'Error reading PDF.');
        console.error(err);
    }
}

function parseDOCX(arrayBuffer) {
    mammoth.extractRawText({ arrayBuffer })
        .then(r => updateCV(r.value))
        .catch(err => { showMessage('error', 'Error reading DOCX.'); console.error(err); });
}

function updateCV(text) {
    document.getElementById('resume-textarea').value = text;
    chrome.storage.local.set({ parsedResume: text }, () => {
        onInputChange();
    });
}

/* ═══════════════════════════════════════════════════════════════
   TAILOR CV
════════════════════════════════════════════════════════════════ */
async function tailorCV() {
    const data = await chrome.storage.local.get(['userToken']);
    const token = data.userToken;
    if (!token) { showMessage('error', 'Add your API key in settings first.'); return; }

    const resumeText = document.getElementById('resume-textarea').value.trim();
    const jobDescription = document.getElementById('job-desc-textarea').value.trim();

    if (!resumeText) { showMessage('error', 'Upload or paste your resume first.'); return; }
    if (!jobDescription) { showMessage('error', 'Add a job description first.'); return; }

    toggleLoader(true);
    try {
        const result = await chrome.runtime.sendMessage({
            action: 'optimizeResume',
            resume: resumeText,
            jobDescription,
            apiToken: token
        });
        if (result.error) throw new Error(result.error);
        window._tailorResult = result;
        showCVResults(result);
    } catch (err) {
        showMessage('error', 'Failed to tailor CV: ' + (err.message || 'unknown error'));
    } finally {
        toggleLoader(false);
    }
}

function showCVResults(result) {
    document.getElementById('main-form').classList.add('hidden');
    document.getElementById('cover-results').classList.add('hidden');
    document.getElementById('back-btn').classList.remove('hidden');

    const score = Number(result.ATSCompatibilityScore) || 0;
    const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
    const circle = document.querySelector('#cv-results .progress-circle');
    const textEl = document.getElementById('ats-text');

    circle.style.strokeDasharray = CIRCUMFERENCE;
    circle.style.strokeDashoffset = CIRCUMFERENCE; // reset
    requestAnimationFrame(() => { circle.style.strokeDashoffset = offset; });

    // Colour by score
    circle.style.stroke = score >= 70 ? '#43a047' : score >= 40 ? '#fb8c00' : '#e53935';
    textEl.textContent = score;

    document.getElementById('ats-explanation').textContent = result.explanation || '';
    document.getElementById('cv-results').classList.remove('hidden');
}

async function downloadCV(result) {
    if (!result) return;
    try {
        const doc = generateResume(result.optimizedResume);
        const blob = await window.docx.Packer.toBlob(doc);
        triggerDownload(blob, result.recomendedFileName || 'tailored-resume.docx');
    } catch (err) {
        showMessage('error', 'Download failed.'); console.error(err);
    }
}

/* ═══════════════════════════════════════════════════════════════
   COVER LETTER
════════════════════════════════════════════════════════════════ */
async function generateCoverLetter() {
    const data = await chrome.storage.local.get(['userToken']);
    const token = data.userToken;
    if (!token) { showMessage('error', 'Add your API key in settings first.'); return; }

    const resumeText = document.getElementById('resume-textarea').value.trim();
    const jobDescription = document.getElementById('job-desc-textarea').value.trim();

    if (!resumeText) { showMessage('error', 'Upload or paste your resume first.'); return; }
    if (!jobDescription) { showMessage('error', 'Add a job description first.'); return; }

    toggleLoader(true);
    try {
        const result = await chrome.runtime.sendMessage({
            action: 'generateCoverLetter',
            resume: resumeText,
            jobDescription,
            apiToken: token
        });
        if (result.error) throw new Error(result.error);
        window._coverResult = result;
        showCoverLetterResults(result);
    } catch (err) {
        showMessage('error', 'Failed to generate cover letter: ' + (err.message || 'unknown error'));
    } finally {
        toggleLoader(false);
    }
}

function showCoverLetterResults(result) {
    document.getElementById('main-form').classList.add('hidden');
    document.getElementById('cv-results').classList.add('hidden');
    document.getElementById('back-btn').classList.remove('hidden');
    document.getElementById('cover-letter-text').value = result.coverLetter || '';
    document.getElementById('cover-results').classList.remove('hidden');
}

async function downloadCoverLetter(result) {
    if (!result) return;
    try {
        const doc = generateCoverLetterDoc(result.coverLetter);
        const blob = await window.docx.Packer.toBlob(doc);
        triggerDownload(blob, result.recommendedFileName || 'cover-letter.docx');
    } catch (err) {
        showMessage('error', 'Download failed.'); console.error(err);
    }
}

function copyCoverLetter() {
    const text = document.getElementById('cover-letter-text').value;
    navigator.clipboard.writeText(text)
        .then(() => showMessage('success', 'Copied to clipboard!'))
        .catch(() => showMessage('error', 'Copy failed.'));
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════════════ */
function goBackToForm() {
    document.getElementById('cv-results').classList.add('hidden');
    document.getElementById('cover-results').classList.add('hidden');
    document.getElementById('back-btn').classList.add('hidden');
    document.getElementById('main-form').classList.remove('hidden');
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY
════════════════════════════════════════════════════════════════ */
function toggleLoader(show) {
    document.getElementById('loader').classList.toggle('hidden', !show);
    document.getElementById('tailor-cv-btn').disabled = show;
    document.getElementById('cover-letter-btn').disabled = show;
}

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showMessage(type, text) {
    const box = document.getElementById('message-box');
    const div = document.createElement('div');
    div.className = 'msg ' + type;
    div.textContent = text;
    box.appendChild(div);
    setTimeout(() => {
        div.classList.add('fade-out');
        setTimeout(() => div.remove(), 350);
    }, 3200);
}

/* ═══════════════════════════════════════════════════════════════
   ENTRY POINT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    initOnboarding();

    chrome.storage.local.get(['onboardingComplete'], (data) => {
        if (data.onboardingComplete) {
            showMainView();
        } else {
            showOnboardingView();
        }
    });
});
