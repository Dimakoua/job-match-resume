/* ═══════════════════════════════════════════════════════════════
   PLATFORM CONFIG
════════════════════════════════════════════════════════════════ */
const PLATFORM_CONFIG = {
    linkedin: {
        jdSelectors: [
            '[data-testid="expandable-text-box"]',                    // current SDUI — most reliable
            '[data-sdui-component*="aboutTheJob"]',                   // SDUI component wrapper
            '.jobs-description__content',                             // Split view content
            '.jobs-box__html-content',                                // Generic inner JD box
            '.jobs-description',                                      // split view / search results
            '#job-details',                                           // classic view fallback
            '.jobs-description-content__text',
            '.jobs-box--nameless',
            '[class*="job-description"]'                             // Broad fallback
        ],
        applySelectors: [
            '.jobs-apply-button--top-card button',                    // Search results top card
            'a[aria-label*="Apply on company website"]',              // external apply (SDUI)
            'button[aria-label*="Easy Apply"]',                       // LinkedIn Easy Apply
            'a[aria-label*="Apply"]',                                 // any apply link
            'button[aria-label*="Apply"]',
            '.jobs-apply-button',                                     // classic view fallback
            '.jobs-s-apply button',
            '.jobs-unified-top-card button',
            '[class*="apply-button"]'                                // Broad fallback
        ]
    },
    indeed: {
        jdSelectors: ['#jobDescriptionText', '.jobsearch-jobDescriptionText'],
        applySelectors: ['#indeedApplyButton', 'button[data-indeed-apply]', '.jobsearch-ApplyButtonContainer button']
    },
    glassdoor: {
        jdSelectors: ["[class*='JobDetails_jobDescription']", "[data-test='job-description']"],
        applySelectors: ["[data-test='applyButton']", "button[class*='apply']"]
    }
};

/* ═══════════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════════════ */
let savedJobDescription = '';
let widgetInjected = false;
let tailorResult = null;
let coverResult = null;

/* ═══════════════════════════════════════════════════════════════
   PLATFORM DETECTION
════════════════════════════════════════════════════════════════ */
function getPlatform() {
    const h = window.location.hostname;
    if (h.includes('linkedin')) return 'linkedin';
    if (h.includes('indeed')) return 'indeed';
    if (h.includes('glassdoor')) return 'glassdoor';
    console.warn('[AI-CV] Unrecognised host:', h);
    return null;
}

function getConfig() {
    const p = getPlatform();
    return p ? PLATFORM_CONFIG[p] : null;
}

/* ═══════════════════════════════════════════════════════════════
   JOB DESCRIPTION EXTRACTION
════════════════════════════════════════════════════════════════ */
function findJobDescription() {
    const cfg = getConfig();
    if (!cfg) return null;
    const platform = getPlatform();
    const isLinkedIn = platform === 'linkedin';

    // LinkedIn-specific scope optimization
    let root = document;
    if (isLinkedIn) {
        root = document.querySelector('.jobs-search-results-list__detail-pane') || 
               document.querySelector('.jobs-search__job-details--container') || 
               document.querySelector('main') || 
               document;
    }

    for (const sel of cfg.jdSelectors) {
        let el = null;
        
        // Special logic for LinkedIn SDUI/nested components
        if (isLinkedIn && sel === '[data-testid="expandable-text-box"]') {
            const aboutSection = root.querySelector('[data-sdui-component*="aboutTheJob"]');
            el = aboutSection
                ? aboutSection.querySelector('[data-testid="expandable-text-box"]') || aboutSection
                : root.querySelector('[data-testid="expandable-text-box"]');
        } else {
            el = root.querySelector(sel);
        }

        if (el) {
            const text = el.innerText.trim();
            if (text.length > 50) {
                console.log('[AI-CV] JD found via selector:', sel, '| chars:', text.length);
                return text;
            }
            console.log('[AI-CV] Selector matched but text too short:', sel, '| chars:', text.length);
        }
    }
    console.warn('[AI-CV] No JD selector matched. Tried:', cfg.jdSelectors);
    return null;
}

function captureJobDescription() {
    const text = findJobDescription();
    if (text && text !== savedJobDescription) {
        savedJobDescription = text;
        console.log('[AI-CV] Job description captured, sending to background.');
        chrome.runtime.sendMessage({ action: 'saveJobDescription', jobDescription: text });
        const shadow = document.querySelector('#ai-cv-widget-host')?.shadowRoot;
        if (shadow) updateWidgetScore(shadow);
    }
}

/* ═══════════════════════════════════════════════════════════════
   WIDGET INJECTION (Shadow DOM)
════════════════════════════════════════════════════════════════ */
const WIDGET_CSS = `
:host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
.w-btns { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 8px 0; }
.w-btn { padding: 7px 14px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
.w-btn.primary { background: #5c6bc0; color: #fff; }
.w-btn.secondary { background: transparent; color: #5c6bc0; border: 1.5px solid #5c6bc0; }
.w-btn:hover { opacity: 0.85; }
.w-badge { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 10px; cursor: pointer; }
.w-badge.high { background: #e8f5e9; color: #2e7d32; }
.w-badge.mid { background: #fff3e0; color: #e65100; }
.w-badge.low { background: #ffebee; color: #c62828; }

/* Overlay */
.overlay { position: fixed; top: 0; right: -450px; width: 430px; height: 100vh; background: #fff;
  box-shadow: -4px 0 24px rgba(0,0,0,0.15); z-index: 2147483647; transition: right 0.3s ease;
  display: flex; flex-direction: column; overflow: hidden; }
.overlay.open { right: 0; }
.ov-header { display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.ov-title { font-size: 14px; font-weight: 700; color: #333; }
.ov-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #888; line-height: 1; padding: 0 4px; }
.ov-body { flex: 1; overflow-y: auto; padding: 14px 16px; }

/* Keyword box */
.kw-box { background: #f8f9ff; border: 1.5px solid #e0e4ff; border-radius: 8px; padding: 11px 12px; margin-bottom: 14px; }
.kw-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.kw-label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.kw-pct { font-size: 18px; font-weight: 700; color: #5c6bc0; }
.kw-pct.high { color: #2e7d32; } .kw-pct.mid { color: #e65100; } .kw-pct.low { color: #c62828; }
.kw-bar-track { height: 5px; background: #e8e8e8; border-radius: 3px; margin-bottom: 8px; overflow: hidden; }
.kw-bar-fill { height: 100%; border-radius: 3px; background: #5c6bc0; transition: width 0.5s ease; }
.kw-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chip { font-size: 11px; padding: 2px 7px; border-radius: 10px; font-weight: 500; }
.chip.m { background: #e8f5e9; color: #2e7d32; }
.chip.x { background: #ffebee; color: #c62828; }

/* Tabs */
.tabs { display: flex; gap: 0; border-bottom: 2px solid #e0e0e0; margin-bottom: 14px; }
.tab { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: #888;
  border: none; background: none; font-family: inherit; border-bottom: 3px solid transparent;
  margin-bottom: -2px; transition: color 0.15s, border-color 0.15s; }
.tab.active { color: #5c6bc0; border-bottom-color: #5c6bc0; }

/* Panes */
.pane { display: none; }
.pane.active { display: block; }

/* Loader */
.loader { height: 3px; background: #e0e0e0; border-radius: 2px; overflow: hidden; position: relative; margin: 8px 0; }
.loader::after { content:''; position:absolute; left:-40%; width:40%; height:100%;
  background:#5c6bc0; border-radius:2px; animation: lb 0.9s linear infinite; }
@keyframes lb { to { left: 110%; } }

/* ATS row */
.ats-row { display: flex; align-items: center; gap: 14px; background: #f8f9ff;
  border: 1.5px solid #e0e4ff; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; }
.ats-score-num { font-size: 32px; font-weight: 700; color: #5c6bc0; flex-shrink: 0; }
.ats-score-num.high { color: #2e7d32; } .ats-score-num.mid { color: #e65100; } .ats-score-num.low { color: #c62828; }
.ats-info { flex: 1; min-width: 0; }
.ats-info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #888; }
.ats-expl { font-size: 12px; color: #555; line-height: 1.4; margin-top: 3px; }

/* Cover preview */
.cover-preview { width: 100%; min-height: 180px; resize: vertical; border: 1.5px solid #e0e0e0;
  border-radius: 6px; font-size: 13px; padding: 10px; font-family: inherit; color: #333; }
.cover-preview:focus { outline: none; border-color: #5c6bc0; }

/* Action button row */
.btn-row { display: flex; gap: 8px; margin-top: 10px; }
.w-action-btn { flex: 1; padding: 9px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; text-align: center; transition: opacity 0.15s; border: none; }
.w-action-btn.primary { background: #5c6bc0; color: #fff; }
.w-action-btn.outline { background: transparent; color: #5c6bc0; border: 1.5px solid #5c6bc0; }
.w-action-btn:hover { opacity: 0.85; }
.w-action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.err-msg { color: #c62828; font-size: 12px; margin-top: 6px; }
`;

const WIDGET_HTML = `
<div class="w-btns">
  <button class="w-btn primary" id="btn-tailor">✨ Tailor CV</button>
  <button class="w-btn secondary" id="btn-cover">✍️ Cover Letter</button>
  <span class="w-badge" id="score-badge" style="display:none"></span>
</div>
<div class="overlay" id="overlay">
  <div class="ov-header">
    <span class="ov-title">✨ AI Resume Optimizer</span>
    <button class="ov-close" id="ov-close">×</button>
  </div>
  <div class="ov-body">
    <div class="kw-box" id="kw-box" style="display:none">
      <div class="kw-row">
        <span class="kw-label">Keyword Match</span>
        <span class="kw-pct" id="kw-pct">0%</span>
      </div>
      <div class="kw-bar-track"><div class="kw-bar-fill" id="kw-bar-fill"></div></div>
      <div class="kw-chips" id="kw-chips"></div>
    </div>
    <div class="tabs">
      <button class="tab active" id="tab-cv" data-tab="cv">Tailored CV</button>
      <button class="tab" id="tab-cover" data-tab="cover">Cover Letter</button>
    </div>
    <div class="pane active" id="pane-cv">
      <div class="loader hidden" id="cv-loader"></div>
      <div id="cv-content"></div>
    </div>
    <div class="pane" id="pane-cover">
      <div class="loader hidden" id="cover-loader"></div>
      <div id="cover-content"></div>
    </div>
  </div>
</div>
`;

function injectWidget(anchorEl) {
    if (widgetInjected) return;
    widgetInjected = true;
    console.log('[AI-CV] Injecting widget. Anchor element:', anchorEl ?? 'none (fixed fallback)');

    const host = document.createElement('div');
    host.id = 'ai-cv-widget-host';
    host.style.cssText = 'all:initial;display:inline-block;';
    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = WIDGET_CSS;
    shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = WIDGET_HTML;
    shadow.appendChild(wrapper);

    // Insert inline after the apply button, or fall back to fixed bottom-right corner
    if (anchorEl) {
        try {
            anchorEl.insertAdjacentElement('afterend', host);
            console.log('[AI-CV] Widget inserted inline after apply button.');
        } catch (err) {
            console.warn('[AI-CV] insertAdjacentElement failed, using fixed fallback:', err.message);
            host.style.cssText = 'all:initial;position:fixed;bottom:24px;right:24px;z-index:2147483646;';
            document.body.appendChild(host);
        }
    } else {
        console.log('[AI-CV] No apply button found, using fixed bottom-right fallback.');
        host.style.cssText = 'all:initial;position:fixed;bottom:24px;right:24px;z-index:2147483646;';
        document.body.appendChild(host);
    }

    wireWidgetEvents(shadow);
    updateWidgetScore(shadow);
    console.log('[AI-CV] Widget ready. CV in storage:', !!localStorage.getItem('parsedResume'), '| API key:', !!localStorage.getItem('userToken'));
}

/* ═══════════════════════════════════════════════════════════════
   WIDGET EVENTS
════════════════════════════════════════════════════════════════ */
function wireWidgetEvents(shadow) {
    shadow.getElementById('btn-tailor').addEventListener('click', () => openOverlay(shadow, 'cv'));
    shadow.getElementById('btn-cover').addEventListener('click', () => openOverlay(shadow, 'cover'));
    shadow.getElementById('ov-close').addEventListener('click', () => closeOverlay(shadow));

    shadow.getElementById('tab-cv').addEventListener('click', () => switchTab(shadow, 'cv'));
    shadow.getElementById('tab-cover').addEventListener('click', () => switchTab(shadow, 'cover'));
}

function openOverlay(shadow, tab) {
    shadow.getElementById('overlay').classList.add('open');
    switchTab(shadow, tab);

    // Auto-run when opened
    if (tab === 'cv') doTailorCV(shadow);
    else doCoverLetter(shadow);
}

function closeOverlay(shadow) {
    shadow.getElementById('overlay').classList.remove('open');
}

function switchTab(shadow, tab) {
    ['cv', 'cover'].forEach(t => {
        shadow.getElementById('tab-' + t).classList.toggle('active', t === tab);
        shadow.getElementById('pane-' + t).classList.toggle('active', t === tab);
    });
}

/* ═══════════════════════════════════════════════════════════════
   KEYWORD SCORE
════════════════════════════════════════════════════════════════ */
async function updateWidgetScore(shadow) {
    const data = await chrome.storage.local.get(['parsedResume']);
    const cv = data.parsedResume;
    const jd = savedJobDescription;
    if (!cv || !jd || !window.keywordMatcher) return;

    const { score, matched, missing } = window.keywordMatcher.scoreMatch(cv, jd);

    // Badge
    const badge = shadow.getElementById('score-badge');
    badge.textContent = score + '%';
    badge.className = 'w-badge ' + (score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low');
    badge.style.display = '';
    badge.addEventListener('click', () => openOverlay(shadow, 'cv'), { once: true });

    // Keyword box
    const box = shadow.getElementById('kw-box');
    const pctEl = shadow.getElementById('kw-pct');
    const barEl = shadow.getElementById('kw-bar-fill');
    const chipsEl = shadow.getElementById('kw-chips');

    pctEl.textContent = score + '%';
    pctEl.className = 'kw-pct ' + (score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low');
    barEl.style.width = score + '%';
    barEl.style.background = score >= 70 ? '#43a047' : score >= 40 ? '#e65100' : '#c62828';

    const topM = matched.slice(0, 5);
    const topX = missing.slice(0, 5);
    chipsEl.innerHTML =
        topM.map(w => `<span class="chip m">✓ ${w}</span>`).join('') +
        topX.map(w => `<span class="chip x">✗ ${w}</span>`).join('');

    box.style.display = '';
}

/* ═══════════════════════════════════════════════════════════════
   TAILOR CV (in widget)
════════════════════════════════════════════════════════════════ */
async function doTailorCV(shadow) {
    if (tailorResult) { renderTailorResult(shadow, tailorResult); return; }

    const data = await chrome.storage.local.get(['userToken', 'parsedResume']);
    const apiToken = data.userToken;
    const resumeText = data.parsedResume;
    const cvContent = shadow.getElementById('cv-content');

    if (!apiToken) {
        cvContent.innerHTML = '<p class="err-msg">⚠️ No API key found. Open the extension popup to set it up.</p>';
        return;
    }
    if (!resumeText) {
        cvContent.innerHTML = '<p class="err-msg">⚠️ No CV found. Upload your resume in the extension popup first.</p>';
        return;
    }
    if (!savedJobDescription) {
        cvContent.innerHTML = '<p class="err-msg">⚠️ Job description not detected yet. Please wait a moment and try again.</p>';
        return;
    }

    cvContent.innerHTML = '';
    shadow.getElementById('cv-loader').classList.remove('hidden');

    try {
        const result = await chrome.runtime.sendMessage({
            action: 'optimizeResume',
            resume: resumeText,
            jobDescription: savedJobDescription,
            apiToken
        });
        if (result.error) throw new Error(result.error);
        tailorResult = result;
        renderTailorResult(shadow, result);
    } catch (err) {
        cvContent.innerHTML = `<p class="err-msg">Error: ${err.message}</p>`;
    } finally {
        shadow.getElementById('cv-loader').classList.add('hidden');
    }
}

function renderTailorResult(shadow, result) {
    const score = Number(result.ATSCompatibilityScore) || 0;
    const cls = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';
    shadow.getElementById('cv-content').innerHTML = `
        <div class="ats-row">
            <div class="ats-score-num ${cls}">${score}</div>
            <div class="ats-info">
                <div class="ats-info-label">ATS Compatibility</div>
                <div class="ats-expl">${result.explanation || ''}</div>
            </div>
        </div>
        <div class="btn-row">
            <button class="w-action-btn primary" id="dl-cv-btn">⬇ Download DOCX</button>
        </div>`;
    shadow.getElementById('dl-cv-btn').addEventListener('click', () => downloadCVFromWidget(result));
}

/* ═══════════════════════════════════════════════════════════════
   COVER LETTER (in widget)
════════════════════════════════════════════════════════════════ */
async function doCoverLetter(shadow) {
    if (coverResult) { renderCoverResult(shadow, coverResult); return; }

    const data = await chrome.storage.local.get(['userToken', 'parsedResume']);
    const apiToken = data.userToken;
    const resumeText = data.parsedResume;
    const coverContent = shadow.getElementById('cover-content');

    if (!apiToken) {
        coverContent.innerHTML = '<p class="err-msg">⚠️ No API key found. Open the extension popup to set it up.</p>';
        return;
    }
    if (!resumeText) {
        coverContent.innerHTML = '<p class="err-msg">⚠️ No CV found. Upload your resume in the extension popup first.</p>';
        return;
    }
    if (!savedJobDescription) {
        coverContent.innerHTML = '<p class="err-msg">⚠️ Job description not detected yet. Please wait a moment and try again.</p>';
        return;
    }

    coverContent.innerHTML = '';
    shadow.getElementById('cover-loader').classList.remove('hidden');

    try {
        const result = await chrome.runtime.sendMessage({
            action: 'generateCoverLetter',
            resume: resumeText,
            jobDescription: savedJobDescription,
            apiToken
        });
        if (result.error) throw new Error(result.error);
        coverResult = result;
        renderCoverResult(shadow, result);
    } catch (err) {
        coverContent.innerHTML = `<p class="err-msg">Error: ${err.message}</p>`;
    } finally {
        shadow.getElementById('cover-loader').classList.add('hidden');
    }
}

function renderCoverResult(shadow, result) {
    shadow.getElementById('cover-content').innerHTML = `
        <textarea class="cover-preview" id="cover-text" rows="12">${result.coverLetter || ''}</textarea>
        <div class="btn-row">
            <button class="w-action-btn primary" id="dl-cover-btn">⬇ Download DOCX</button>
            <button class="w-action-btn outline" id="copy-cover-btn">📋 Copy</button>
        </div>`;
    shadow.getElementById('dl-cover-btn').addEventListener('click', () => downloadCoverFromWidget(result));
    shadow.getElementById('copy-cover-btn').addEventListener('click', () => {
        const text = shadow.getElementById('cover-text').value;
        navigator.clipboard.writeText(text).catch(() => {});
    });
}

/* ═══════════════════════════════════════════════════════════════
   DOWNLOADS
════════════════════════════════════════════════════════════════ */
async function downloadCVFromWidget(result) {
    console.log('[AI-CV] Downloading tailored CV...');
    try {
        const doc = generateResume(result.optimizedResume);
        const blob = await window.docx.Packer.toBlob(doc);
        console.log('[AI-CV] CV blob size:', blob.size, 'bytes');
        triggerDownload(blob, result.recomendedFileName || 'tailored-resume.docx');
    } catch (err) { console.error('[AI-CV] CV download failed:', err); }
}

async function downloadCoverFromWidget(result) {
    console.log('[AI-CV] Downloading cover letter...');
    try {
        const doc = generateCoverLetterDoc(result.coverLetter);
        const blob = await window.docx.Packer.toBlob(doc);
        console.log('[AI-CV] Cover letter blob size:', blob.size, 'bytes');
        triggerDownload(blob, result.recommendedFileName || 'cover-letter.docx');
    } catch (err) { console.error('[AI-CV] Cover letter download failed:', err); }
}

function triggerDownload(blob, filename) {
    // URL.createObjectURL produces chrome-extension://invalid/ in content scripts,
    // so we use FileReader to get a plain data URL instead.
    const reader = new FileReader();
    reader.onload = () => {
        const a = document.createElement('a');
        a.href = reader.result;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    reader.readAsDataURL(blob);
}

/* ═══════════════════════════════════════════════════════════════
   WIDGET FINDER & OBSERVER
════════════════════════════════════════════════════════════════ */
function findApplyButton() {
    const cfg = getConfig();
    if (!cfg) return null;
    const isLinkedIn = getPlatform() === 'linkedin';

    for (const sel of cfg.applySelectors) {
        let el = null;
        if (isLinkedIn) {
            // Prefer the apply button in the detail pane for search results
            const detailPane = document.querySelector('.jobs-search-results-list__detail-pane') || 
                               document.querySelector('.jobs-search__job-details--container');
            el = detailPane ? detailPane.querySelector(sel) : document.querySelector(sel);
        } else {
            el = document.querySelector(sel);
        }

        if (el) {
            console.log('[AI-CV] Apply button found via selector:', sel);
            return el;
        }
    }
    console.warn('[AI-CV] No apply button selector matched. Tried:', cfg.applySelectors);
    return null;
}

function tryInjectWidget() {
    if (widgetInjected) return;
    captureJobDescription();
    const applyBtn = findApplyButton();
    console.log('[AI-CV] tryInjectWidget — applyBtn:', !!applyBtn, '| savedJD:', !!savedJobDescription);
    if (applyBtn || savedJobDescription) {
        injectWidget(applyBtn);
    }
}

function initObserver() {
    let retries = 0;
    const maxRetries = 20;

    function attempt() {
        tryInjectWidget();
        if (!widgetInjected && retries < maxRetries) {
            retries++;
            setTimeout(attempt, 500);
        }
    }

    // MutationObserver for dynamic content
    const observer = new MutationObserver(() => {
        captureJobDescription();
        if (!widgetInjected) tryInjectWidget();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    attempt();
}

// SPA navigation detection — reset state on URL change
let lastHref = location.href;
new MutationObserver(() => {
    if (location.href !== lastHref) {
        lastHref = location.href;
        widgetInjected = false;
        tailorResult = null;
        coverResult = null;
        savedJobDescription = '';
        const old = document.getElementById('ai-cv-widget-host');
        if (old) old.remove();
        // Re-init after brief delay for SPA page to render
        setTimeout(initObserver, 800);
    }
}).observe(document.body, { childList: true, subtree: true });

/* ═══════════════════════════════════════════════════════════════
   MESSAGE LISTENER
════════════════════════════════════════════════════════════════ */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'getJobDescription') {
        sendResponse({ jobDescription: savedJobDescription });
    }
    return true;
});

/* ═══════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════════ */
const _platform = getPlatform();
console.log('[AI-CV] Content script booted. Platform:', _platform, '| URL:', location.href);
if (_platform) {
    initObserver();
} else {
    console.warn('[AI-CV] Not a supported job page, content script idle.');
}
