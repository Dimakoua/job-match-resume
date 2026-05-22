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
   OBSERVER
════════════════════════════════════════════════════════════════ */
function tryInjectWidget() {
    captureJobDescription();
    if (savedJobDescription) {
        injectFloatingDownloadWidget();
    }
}

function initObserver() {
    let retries = 0;
    const maxRetries = 20;

    function attempt() {
        tryInjectWidget();
        if (!floatingWidgetInjected && retries < maxRetries) {
            retries++;
            setTimeout(attempt, 500);
        }
    }

    // MutationObserver for dynamic content
    const observer = new MutationObserver(() => {
        captureJobDescription();
        if (!floatingWidgetInjected) tryInjectWidget();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    attempt();
}

// SPA navigation detection — reset state on URL change
let lastHref = location.href;
new MutationObserver(() => {
    if (location.href !== lastHref) {
        lastHref = location.href;
        floatingWidgetInjected = false;
        savedJobDescription = '';
        const old = document.getElementById('ai-cv-download-widget-host');
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
