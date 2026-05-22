/* ═══════════════════════════════════════════════════════════════
   FLOATING DOWNLOAD WIDGET — injected on job pages
════════════════════════════════════════════════════════════════ */

let floatingWidgetInjected = false;

function injectFloatingDownloadWidget() {
    if (floatingWidgetInjected) return;
    floatingWidgetInjected = true;

    const host = document.createElement('div');
    host.id = 'ai-cv-download-widget-host';
    host.style.cssText = 'all:initial;';
    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .dl-widget {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 2147483646;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 16px;
            width: 200px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        }
        .dl-title {
            font-size: 12px;
            font-weight: 700;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            text-align: center;
        }
        .dl-buttons {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .dl-btn {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .dl-btn-primary {
            background: #5c6bc0;
            color: #fff;
        }
        .dl-btn-primary:hover { background: #3f51b5; }
        .dl-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .dl-btn-secondary {
            background: #f0f2ff;
            color: #5c6bc0;
            border: 1px solid #c9ccf0;
        }
        .dl-btn-secondary:hover { background: #f9faff; }
        .dl-btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
        .dl-btn.loading {
            opacity: 0.7;
            cursor: wait;
        }
        .dl-spinner {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid rgba(255,255,255,0.4);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        .dl-btn-secondary .dl-spinner { border-top-color: #5c6bc0; border-color: rgba(92,107,192,0.3); }
        @keyframes spin { to { transform: rotate(360deg); } }
    `;
    shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.className = 'dl-widget';
    wrapper.innerHTML = `
        <div class="dl-title">✨ Download</div>
        <div class="dl-buttons">
            <button class="dl-btn dl-btn-primary" id="dl-cv-btn">📄 CV</button>
            <button class="dl-btn dl-btn-secondary" id="dl-cover-btn">✍️ Letter</button>
        </div>
    `;
    shadow.appendChild(wrapper);

    // Wire events
    shadow.getElementById('dl-cv-btn').addEventListener('click', () => triggerCVDownload(shadow));
    shadow.getElementById('dl-cover-btn').addEventListener('click', () => triggerCoverDownload(shadow));

    document.body.appendChild(host);
    console.log('[AI-CV] Floating download widget injected.');
}

async function triggerCVDownload(shadow) {
    const btn = shadow.getElementById('dl-cv-btn');
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<span class="dl-spinner"></span>';

    try {
        const data = await chrome.storage.local.get(['userToken', 'parsedResume']);
        const apiToken = data.userToken;
        const resumeText = data.parsedResume;
        // savedJobDescription should be global from content.js
        const jd = window.savedJobDescription;

        if (!apiToken || !resumeText || !jd) {
            console.warn('[AI-CV] Missing data for CV download');
            return;
        }

        // Request tailored CV from background
        const result = await chrome.runtime.sendMessage({
            action: 'optimizeResume',
            resume: resumeText,
            jobDescription: jd,
            apiToken
        });

        if (result.error) throw new Error(result.error);

        // Generate DOCX
        const doc = generateResume(result.optimizedResume);
        const blob = await window.docx.Packer.toBlob(doc);
        downloadBlobFromContent(blob, 'tailored-resume.docx');
        console.log('[AI-CV] CV downloaded.');
    } catch (err) {
        console.error('[AI-CV] CV download failed:', err);
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = '📄 CV';
    }
}

async function triggerCoverDownload(shadow) {
    const btn = shadow.getElementById('dl-cover-btn');
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<span class="dl-spinner"></span>';

    try {
        const data = await chrome.storage.local.get(['userToken', 'parsedResume']);
        const apiToken = data.userToken;
        const resumeText = data.parsedResume;
        const jd = window.savedJobDescription;

        if (!apiToken || !resumeText || !jd) {
            console.warn('[AI-CV] Missing data for cover letter download');
            return;
        }

        // Request cover letter from background
        const result = await chrome.runtime.sendMessage({
            action: 'generateCoverLetter',
            resume: resumeText,
            jobDescription: jd,
            apiToken
        });

        if (result.error) throw new Error(result.error);

        // Generate DOCX
        const doc = generateCoverLetterDoc(result.coverLetter);
        const blob = await window.docx.Packer.toBlob(doc);
        downloadBlobFromContent(blob, 'cover-letter.docx');
        console.log('[AI-CV] Cover letter downloaded.');
    } catch (err) {
        console.error('[AI-CV] Cover letter download failed:', err);
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = '✍️ Letter';
    }
}

function downloadBlobFromContent(blob, filename) {
    // Use FileReader to avoid chrome-extension://invalid/ in content scripts
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
