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
:host { all: initial; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.w-btns { 
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap; 
  margin: 12px 0; padding: 12px; background: #ffffff; 
  border: 1px solid #e5e7eb; border-radius: 12px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.08); position: relative;
}
.w-btn { 
  padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; 
  cursor: pointer; font-family: inherit; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.w-btn.primary { 
  background: #4f46e5; color: #fff; 
}
.w-btn.secondary { 
  background: #ffffff; color: #4f46e5; border: 1.5px solid #e0e7ff; 
}
.w-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15); opacity: 1; }
.w-btn:active { transform: translateY(0); }

.w-badge { 
  font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; cursor: pointer;
  transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  background: #ffffff;
}
.w-badge:hover { transform: scale(1.05); }
.w-badge.high { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
.w-badge.mid { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
.w-badge.low { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }

/* Overlay */
.overlay { 
  position: fixed; top: 0; right: -460px; width: 440px; height: 100vh; 
  background: #ffffff; opacity: 1;
  box-shadow: -10px 0 40px rgba(0,0,0,0.12); z-index: 2147483647; 
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; overflow: hidden; border-left: 1px solid #e5e7eb;
}
.overlay.open { right: 0; }
.ov-header { 
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
  background: #f9fafb;
}
.ov-title { 
  font-size: 15px; font-weight: 800; color: #111827; letter-spacing: -0.01em;
  display: flex; align-items: center; gap: 8px;
}
.ov-close { 
  background: #f3f4f6; border: none; width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; cursor: pointer; color: #6b7280; transition: all 0.2s;
}
.ov-close:hover { background: #e5e7eb; color: #111827; }
.ov-body { flex: 1; overflow-y: auto; padding: 20px 24px; scrollbar-width: thin; background: #ffffff; }

/* Keyword box */
.kw-box { 
  background: #f1f5f9; 
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;
}
.kw-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.kw-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.kw-pct { font-size: 24px; font-weight: 800; color: #4f46e5; }
.kw-pct.high { color: #059669; } .kw-pct.mid { color: #d97706; } .kw-pct.low { color: #dc2626; }
.kw-bar-track { height: 6px; background: #e2e8f0; border-radius: 3px; margin-bottom: 12px; overflow: hidden; }
.kw-bar-fill { height: 100%; border-radius: 3px; background: #4f46e5; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.kw-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { 
  font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 600;
  display: flex; align-items: center; gap: 4px; border: 1px solid transparent;
  background: #ffffff;
}
.chip.m { color: #059669; border-color: #d1fae5; }
.chip.x { color: #dc2626; border-color: #fee2e2; }

/* Tabs */
.tabs { display: flex; gap: 4px; background: #f3f4f6; padding: 4px; border-radius: 10px; margin-bottom: 20px; }
.tab { 
  flex: 1; padding: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: #6b7280;
  border: none; background: none; font-family: inherit; border-radius: 7px;
  transition: all 0.2s; 
}
.tab.active { background: #ffffff; color: #4f46e5; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

/* Panes */
.pane { display: none; animation: fadeIn 0.3s ease; background: #ffffff; }
.pane.active { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* Loader */
.loader { height: 3px; background: #f3f4f6; border-radius: 2px; overflow: hidden; position: relative; margin: 12px 0; }
.loader::after { 
  content:''; position:absolute; left:-40%; width:40%; height:100%;
  background: #4f46e5; 
  border-radius:2px; animation: lb 1.2s infinite; 
}
@keyframes lb { to { left: 140%; } }

/* ATS row */
.ats-row { 
  display: flex; align-items: center; gap: 20px; background: #ffffff;
  border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.ats-score-num { 
  font-size: 36px; font-weight: 800; color: #4f46e5; flex-shrink: 0; width: 64px; height: 64px;
  display: flex; align-items: center; justify-content: center; background: #f5f3ff; border-radius: 50%;
}
.ats-score-num.high { color: #059669; background: #ecfdf5; } 
.ats-score-num.mid { color: #d97706; background: #fff3e0; } 
.ats-score-num.low { color: #dc2626; background: #fef2f2; }
.ats-info { flex: 1; min-width: 0; }
.ats-info-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
.ats-expl { font-size: 13px; color: #475569; line-height: 1.5; margin-top: 4px; }

/* Cover preview */
.cover-preview { 
  width: 100%; min-height: 300px; resize: vertical; border: 1px solid #e2e8f0;
  border-radius: 10px; font-size: 13px; padding: 16px; font-family: inherit; color: #1e293b;
  line-height: 1.6; background: #ffffff;
}
.cover-preview:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

/* Action button row */
.btn-row { display: flex; gap: 10px; margin-top: 16px; }
.w-action-btn { 
  flex: 1; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; text-align: center; transition: all 0.2s; border: none;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.w-action-btn.primary { background: #4f46e5; color: #fff; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); }
.w-action-btn.outline { background: #ffffff; color: #4f46e5; border: 1.5px solid #e0e7ff; }
.w-action-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.w-action-btn:active { transform: translateY(0); }
.w-action-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.err-msg { 
  background: #fef2f2; color: #b91c1c; font-size: 12px; padding: 12px; 
  border-radius: 8px; border: 1px solid #fee2e2; margin-top: 12px;
  display: flex; align-items: flex-start; gap: 8px;
}
.hidden { display: none; }
`;

const WIDGET_HTML = `
<div class="w-btns">
  <button class="w-btn primary" id="btn-tailor">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    Tailor CV
  </button>
  <button class="w-btn secondary" id="btn-cover">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    Cover Letter
  </button>
  <span class="w-badge" id="score-badge" style="display:none"></span>
</div>
<div class="overlay" id="overlay">
  <div class="ov-header">
    <span class="ov-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      AI Resume Optimizer
    </span>
    <button class="ov-close" id="ov-close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
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
    if (!cv || !jd || !window.atsScorer) return;

    const result = await window.atsScorer.execute({ resumeText: cv, jobDescription: jd });
    const { score, matchedKeywords: matched, missedKeywords: missing } = result;

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
