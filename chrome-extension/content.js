let floatingCard          = null;
let savedJobDescription   = null;

// ── Selectors per job site ────────────────────────────────────

const SITE_CONFIG = {
    linkedin: {
        jd:      '*[data-test-job-description-text], .job-details-about-the-job-module__description',
        title:   '.job-details-jobs-unified-top-card__job-title h1, h1.t-24',
        company: '.job-details-jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name',
    },
    indeed: {
        jd:      '#jobDescriptionText',
        title:   'h1.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"]',
        company: '.jobsearch-InlineCompanyRating-companyHeader a, .jobsearch-CompanyInfoContainer a',
    },
    glassdoor: {
        jd:      "[class*='JobDetails_jobDescription']",
        title:   'h1[data-test="job-title"]',
        company: '[data-test="employer-name"]',
    },
};

function getSiteKey() {
    const host = window.location.hostname;
    if (host.includes('linkedin'))  return 'linkedin';
    if (host.includes('indeed'))    return 'indeed';
    if (host.includes('glassdoor')) return 'glassdoor';
    return null;
}

function detectJobMeta(siteKey) {
    const cfg     = SITE_CONFIG[siteKey];
    const title   = document.querySelector(cfg.title)?.innerText?.trim()   || '';
    const company = document.querySelector(cfg.company)?.innerText?.trim() || '';
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

    document.getElementById('roa-save-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage({
            action:           'openPopupAndShowJobSave',
            jobDescription:   savedJobDescription,
            detectedJobTitle: subtitle,
        });
        removeFloatingCard();
    });

    document.getElementById('roa-optimize-btn').addEventListener('click', () => {
        // Store JD for optimize tab and open popup
        chrome.runtime.sendMessage({
            action:         'saveJobDescription',
            jobDescription: savedJobDescription,
        });
        removeFloatingCard();
    });
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

function waitForJobDescription() {
    const siteKey = getSiteKey();
    if (!siteKey) return;

    const selector = SITE_CONFIG[siteKey].jd;

    function handleElement(el) {
        const text = el.innerText?.trim() || '';
        if (text.length < 50) return;          // too short — probably not a real JD
        savedJobDescription = text;
        sendJobDescription(text);
        injectFloatingCard(text, siteKey);
    }

    // Already in DOM?
    const existing = document.querySelector(selector);
    if (existing && (existing.innerText?.trim()?.length || 0) >= 50) {
        handleElement(existing);
        return;
    }

    // Wait for it
    const observer = new MutationObserver((_mutations, obs) => {
        const el = document.querySelector(selector);
        if (el && (el.innerText?.trim()?.length || 0) >= 50) {
            obs.disconnect();
            handleElement(el);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
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

// ── Boot ──────────────────────────────────────────────────────
waitForJobDescription();
