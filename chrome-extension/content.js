let floatingCard          = null;
let savedJobDescription   = null;

// ── Selectors per job site ────────────────────────────────────

const SITE_CONFIG = {
    linkedin: {
        jd:      [
            '.job-details-about-the-job-module__description',
            '[data-test-job-description-text]',
            '.jobs-description__content',
            '.jobs-box__html-content',
        ],
        title:   [
            'h1.job-details-jobs-unified-top-card__job-title',
            '.job-details-jobs-unified-top-card__job-title h1',
            'h1.jobs-unified-top-card__job-title',
            '.jobs-unified-top-card__job-title h1',
            'h1[class*="job-title"]',
            'h1.t-24',
        ],
        company: [
            '.job-details-jobs-unified-top-card__company-name a',
            '.job-details-jobs-unified-top-card__company-name',
            '.jobs-unified-top-card__company-name a',
            '.jobs-unified-top-card__company-name',
            '[data-tracking-control-name*="company"]',
            'a[href*="/company/"]',
        ],
    },
    indeed: {
        jd:      ['#jobDescriptionText'],
        title:   [
            'h1.jobsearch-JobInfoHeader-title',
            'h1[data-testid="jobsearch-JobInfoHeader-title"]',
        ],
        company: [
            '.jobsearch-InlineCompanyRating-companyHeader a',
            '.jobsearch-CompanyInfoContainer a',
            '[data-testid="inlineHeader-companyName"] a',
            '[data-testid="inlineHeader-companyName"]',
        ],
    },
    glassdoor: {
        jd:      ["[class*='JobDetails_jobDescription']"],
        title:   ['h1[data-test="job-title"]'],
        company: ['[data-test="employer-name"]'],
    },
};

function getSiteKey() {
    const host = window.location.hostname;
    if (host.includes('linkedin'))  return 'linkedin';
    if (host.includes('indeed'))    return 'indeed';
    if (host.includes('glassdoor')) return 'glassdoor';
    return null;
}

function queryFirst(selectors) {
    for (const sel of selectors) {
        try {
            const el = document.querySelector(sel);
            if (el) return el;
        } catch (_) { /* invalid selector — skip */ }
    }
    return null;
}

// Parse LinkedIn page title: "Job Title at Company | LinkedIn"
function parseLinkedInTitle() {
    const raw = document.title || '';
    const noSuffix = raw.replace(/\s*\|\s*LinkedIn\s*$/i, '').trim();
    const atMatch  = noSuffix.match(/^(.+?)\s+at\s+(.+)$/i);
    if (atMatch) return { title: atMatch[1].trim(), company: atMatch[2].trim() };
    const hiringMatch = noSuffix.match(/^(.+?)\s+(?:is hiring|hiring)\s+(.+)$/i);
    if (hiringMatch) return { title: hiringMatch[2].trim(), company: hiringMatch[1].trim() };
    return { title: noSuffix, company: '' };
}

function detectJobMeta(siteKey) {
    const cfg     = SITE_CONFIG[siteKey];
    let   title   = queryFirst(cfg.title)?.innerText?.trim()   || '';
    let   company = queryFirst(cfg.company)?.innerText?.trim() || '';

    // LinkedIn-specific fallback: parse page <title> tag
    if (siteKey === 'linkedin' && (!title || !company)) {
        const parsed = parseLinkedInTitle();
        if (!title   && parsed.title)   title   = parsed.title;
        if (!company && parsed.company) company = parsed.company;
    }

    return { title, company };
}

// ── Floating card ─────────────────────────────────────────────

function injectFloatingCard(jobDescription, siteKey) {
    if (floatingCard) return;   // already shown

    const { title, company } = detectJobMeta(siteKey);
    const subtitle = title && company
        ? `${title} · ${company}`
        : title || company || 'Job found on this page';

    floatingCard = document.createElement('div');
    floatingCard.id = 'roa-floating-card';

    // Inject keyframe + base styles via a <style> tag (avoids CSP issues with cssText)
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        @keyframes roaSlideIn {
            from { transform: translateX(120%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes roaSlideOut {
            from { transform: translateX(0);    opacity: 1; }
            to   { transform: translateX(120%); opacity: 0; }
        }
        #roa-floating-card {
            position: fixed;
            bottom: 24px;
            right:  24px;
            width:  300px;
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 8px 32px rgba(0,0,0,.18), 0 1px 6px rgba(0,0,0,.08);
            border-left: 4px solid #2463eb;
            padding: 14px 16px 12px;
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: roaSlideIn .35s cubic-bezier(.16,1,.3,1) both;
        }
        #roa-floating-card .roa-header {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 12px;
        }
        #roa-floating-card .roa-icon-wrap {
            width: 34px; height: 34px;
            background: #eff4ff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        #roa-floating-card .roa-texts { flex: 1; min-width: 0; }
        #roa-floating-card .roa-title {
            font-size: 13px;
            font-weight: 700;
            color: #0e121b;
            line-height: 1.25;
            margin: 0;
        }
        #roa-floating-card .roa-subtitle {
            font-size: 12px;
            color: #6b7280;
            margin: 3px 0 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
        }
        #roa-floating-card .roa-close {
            background: transparent;
            border: none;
            cursor: pointer;
            color: #9ca3af;
            font-size: 20px;
            line-height: 1;
            padding: 0;
            flex-shrink: 0;
            transition: color .15s;
        }
        #roa-floating-card .roa-close:hover { color: #374151; }
        #roa-floating-card .roa-actions {
            display: flex;
            gap: 8px;
        }
        #roa-floating-card .roa-btn-primary,
        #roa-floating-card .roa-btn-secondary {
            flex: 1;
            padding: 8px 10px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 12px;
            font-weight: 600;
            transition: background .15s, color .15s;
        }
        #roa-floating-card .roa-btn-primary {
            background: #2463eb;
            color: #fff;
        }
        #roa-floating-card .roa-btn-primary:hover  { background: #1d4ed8; }
        #roa-floating-card .roa-btn-secondary {
            background: #f3f4f6;
            color: #374151;
        }
        #roa-floating-card .roa-btn-secondary:hover { background: #e5e7eb; }
        #roa-floating-card .roa-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            padding: 6px 0 2px;
        }
        #roa-floating-card .roa-status.loading { color: #6b7280; }
        #roa-floating-card .roa-status.success  { color: #10b981; }
        #roa-floating-card .roa-status.error    { color: #ef4444; }
        @keyframes roaSpin {
            to { transform: rotate(360deg); }
        }
        #roa-floating-card .roa-spinner {
            width: 16px; height: 16px;
            border: 2px solid #e5e7eb;
            border-top-color: #6b7280;
            border-radius: 50%;
            animation: roaSpin .7s linear infinite;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(styleEl);

    floatingCard.innerHTML = `
        <div class="roa-header">
            <div class="roa-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#2463eb" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v-2H8v2zm0-4h8v-2H8v2zm0-4h5V7H8v2z"/>
                </svg>
            </div>
            <div class="roa-texts">
                <p class="roa-title">Job Description Detected</p>
                <p class="roa-subtitle">${escapeHtml(subtitle)}</p>
            </div>
            <button class="roa-close" id="roa-dismiss" title="Dismiss">&#x2715;</button>
        </div>
        <div class="roa-actions">
            <button class="roa-btn-primary"   id="roa-save-btn">Save Application</button>
            <button class="roa-btn-secondary" id="roa-optimize-btn">Optimize CV</button>
        </div>
    `;

    document.body.appendChild(floatingCard);

    document.getElementById('roa-dismiss').addEventListener('click', removeFloatingCard);

    document.getElementById('roa-save-btn').addEventListener('click', () =>
        doSaveApplication(subtitle, company, title)
    );

    document.getElementById('roa-optimize-btn').addEventListener('click', () => {
        // Store JD for optimize tab and open popup
        chrome.runtime.sendMessage({
            action:         'saveJobDescription',
            jobDescription: savedJobDescription,
        });
        removeFloatingCard();
    });
}

async function doSaveApplication(subtitle, company, title) {
    const { userToken } = await chrome.storage.local.get(['userToken']);

    // Not logged in → open popup so user can log in first
    if (!userToken) {
        chrome.runtime.sendMessage({
            action:           'openPopupAndShowJobSave',
            jobDescription:   savedJobDescription,
            detectedJobTitle: title,
            detectedCompany:  company,
        });
        removeFloatingCard();
        return;
    }

    // Missing company or title → open popup pre-filled so user can complete them
    if (!company || !title) {
        chrome.runtime.sendMessage({
            action:           'openPopupAndShowJobSave',
            jobDescription:   savedJobDescription,
            detectedJobTitle: title,
            detectedCompany:  company,
        });
        removeFloatingCard();
        return;
    }

    // All data present — save directly via background worker (avoids CORS)
    setCardState('loading');

    chrome.runtime.sendMessage({
        action:         'saveJobApplicationFromContent',
        company,
        position:       title,
        jobDescription: savedJobDescription,
        url:            location.href,
        userToken,
    }, (response) => {
        if (response?.success) {
            setCardState('success');
            setTimeout(removeFloatingCard, 2200);
        } else {
            setCardState('error', response?.message || 'Could not save — try again.', subtitle, company, title);
        }
    });
}

function setCardState(state, message, subtitle, company, title) {
    const actions = floatingCard?.querySelector('.roa-actions');
    if (!actions) return;

    if (state === 'loading') {
        actions.innerHTML = `
            <div class="roa-status loading">
                <div class="roa-spinner"></div>
                Saving…
            </div>`;
    } else if (state === 'success') {
        actions.innerHTML = `
            <div class="roa-status success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Saved to your applications!
            </div>`;
    } else if (state === 'error') {
        actions.innerHTML = `
            <div class="roa-status error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ${escapeHtml(message || 'Something went wrong')}
            </div>
            <button class="roa-btn-primary" id="roa-retry-btn" style="margin-top:8px;width:100%">Retry</button>`;
        floatingCard.querySelector('#roa-retry-btn')
            ?.addEventListener('click', () => doSaveApplication(subtitle, company, title));
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function removeFloatingCard() {
    if (!floatingCard) return;
    floatingCard.style.animation = 'roaSlideOut .25s ease both';
    setTimeout(() => {
        floatingCard?.remove();
        floatingCard = null;
    }, 260);
}

// ── JD observer ───────────────────────────────────────────────

let _activeJdObserver = null;   // track so we can cancel it on navigation

function waitForJobDescription() {
    // Cancel any pending observer from a previous navigation
    if (_activeJdObserver) {
        _activeJdObserver.disconnect();
        _activeJdObserver = null;
    }

    const siteKey = getSiteKey();
    if (!siteKey) return;

    const selectors = SITE_CONFIG[siteKey].jd;

    function handleElement(el) {
        const text = el.innerText?.trim() || '';
        if (text.length < 50) return;          // too short — probably not a real JD
        savedJobDescription = text;
        sendJobDescription(text);
        injectFloatingCard(text, siteKey);
    }

    // Already in DOM?
    const existing = queryFirst(selectors);
    if (existing && (existing.innerText?.trim()?.length || 0) >= 50) {
        handleElement(existing);
        return;
    }

    // Wait for it
    _activeJdObserver = new MutationObserver((_mutations, obs) => {
        const el = queryFirst(selectors);
        if (el && (el.innerText?.trim()?.length || 0) >= 50) {
            obs.disconnect();
            _activeJdObserver = null;
            handleElement(el);
        }
    });
    _activeJdObserver.observe(document.body, { childList: true, subtree: true });
}

function sendJobDescription(jobDescription) {
    chrome.runtime.sendMessage({ action: 'saveJobDescription', jobDescription });
}

// ── Message listener ──────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'getJobDescription') {
        waitForJobDescription();
        sendResponse({ jobDescription: savedJobDescription });
    }
    return true;
});

// ── SPA navigation detection ──────────────────────────────────
// LinkedIn, Indeed and Glassdoor navigate via pushState — the page never fully
// reloads. Poll the URL every 500 ms (negligible CPU). On change: immediately
// destroy the old card (synchronously, no animation delay), reset state, and
// re-run JD detection after a short pause for the new content to render.

let _lastUrl = location.href;

function _onUrlChange() {
    if (location.href === _lastUrl) return;
    _lastUrl = location.href;

    // Synchronously destroy the old card so the guard in injectFloatingCard
    // doesn't block the new one (avoids race with the 260ms slide-out timer)
    if (floatingCard) {
        floatingCard.remove();
        floatingCard = null;
    }
    if (_activeJdObserver) {
        _activeJdObserver.disconnect();
        _activeJdObserver = null;
    }
    savedJobDescription = null;

    // Give the SPA time to render the new job content
    setTimeout(waitForJobDescription, 700);
}

// Poll every 500 ms — reliable across all SPA router implementations
setInterval(_onUrlChange, 500);

// ── Boot ──────────────────────────────────────────────────────
waitForJobDescription();
