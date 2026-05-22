/* ═══════════════════════════════════════════════════════════════
   FLOATING DOWNLOAD WIDGET — injected on job pages
════════════════════════════════════════════════════════════════ */

let floatingWidgetInjected = false;
let floatingWidgetMinimized = false;

function injectFloatingDownloadWidget() {
    if (floatingWidgetInjected) return;
    floatingWidgetInjected = true;

    const host = document.createElement('div');
    host.id = 'ai-cv-download-widget-host';
    host.style.cssText = 'all:initial;';
    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
        :host { all: initial; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .dl-widget {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 2147483646;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            padding: 16px;
            width: 220px;
            border: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dl-widget.minimized {
            width: 48px;
            height: 48px;
            padding: 0;
            border-radius: 50%;
            cursor: pointer;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            bottom: 24px;
            right: 24px;
        }
        .dl-widget.minimized .dl-header, .dl-widget.minimized .dl-buttons {
            display: none;
        }
        .dl-tail {
            display: none;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
            color: #4f46e5;
            transition: transform 0.2s;
        }
        .dl-widget.minimized .dl-tail {
            display: flex;
        }
        .dl-widget.minimized:hover { transform: scale(1.1); }

        @keyframes slideIn {
            from { transform: translateX(30px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .dl-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.01em;
        }
        .dl-title-group { display: flex; align-items: center; gap: 8px; }
        .dl-header svg { color: #4f46e5; }
        .dl-hide-btn {
            background: none; border: none; cursor: pointer; color: #94a3b8;
            padding: 4px; border-radius: 4px; display: flex; transition: all 0.2s;
        }
        .dl-hide-btn:hover { background: #f3f4f6; color: #4f46e5; }
        
        .dl-buttons {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .dl-btn {
            padding: 10px 14px;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .dl-btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #fff;
        }
        .dl-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
        .dl-btn-secondary {
            background: #ffffff;
            color: #4f46e5;
            border: 1.5px solid #e0e7ff;
        }
        .dl-btn-secondary:hover { background: #f9faff; border-color: #c7d2fe; }
        .dl-btn:active { transform: translateY(0); }
        .dl-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        .dl-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        .dl-btn-secondary .dl-spinner { border-top-color: #4f46e5; border-color: rgba(79,70,229,0.1); }
        @keyframes spin { to { transform: rotate(360deg); } }
    `;
    shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.id = 'dl-wrapper';
    wrapper.className = 'dl-widget';
    wrapper.innerHTML = `
        <div class="dl-header">
            <div class="dl-title-group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                AI Optimizer
            </div>
            <button class="dl-hide-btn" id="dl-hide-btn" title="Hide widget">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
        </div>
        <div class="dl-buttons">
            <button class="dl-btn dl-btn-primary" id="dl-cv-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                Tailor CV
            </button>
            <button class="dl-btn dl-btn-secondary" id="dl-cover-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Cover Letter
            </button>
        </div>
        <div class="dl-tail" id="dl-tail">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        </div>
    `;
    shadow.appendChild(wrapper);

    // Wire events
    shadow.getElementById('dl-cv-btn').addEventListener('click', () => triggerCVDownload(shadow));
    shadow.getElementById('dl-cover-btn').addEventListener('click', () => triggerCoverDownload(shadow));
    shadow.getElementById('dl-hide-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFloatingWidget(shadow);
    });
    shadow.getElementById('dl-tail').addEventListener('click', () => {
        if (floatingWidgetMinimized) toggleFloatingWidget(shadow);
    });

    document.body.appendChild(host);
    console.log('[AI-CV] Floating premium widget injected.');
}

function toggleFloatingWidget(shadow) {
    floatingWidgetMinimized = !floatingWidgetMinimized;
    const wrapper = shadow.getElementById('dl-wrapper');
    wrapper.classList.toggle('minimized', floatingWidgetMinimized);
    const hideBtn = shadow.getElementById('dl-hide-btn');
    hideBtn.style.display = floatingWidgetMinimized ? 'none' : 'flex';
}

async function triggerCVDownload(shadow) {
    const btn = shadow.getElementById('dl-cv-btn');
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<span class="dl-spinner"></span>';

    console.log('[AI-CV] 🛠️ triggerCVDownload started');

    try {
        const data = await chrome.storage.local.get(['userToken', 'parsedResume']);
        const apiToken = data.userToken;
        const resumeText = data.parsedResume;
        // savedJobDescription should be global from content.js
        const jd = window.savedJobDescription;

        console.log('[AI-CV] Data check - Token:', !!apiToken, '| Resume:', !!resumeText, '| JD:', !!jd);

        if (!apiToken || !resumeText || !jd) {
            console.error('[AI-CV] ❌ Missing data for CV download. Aborting.');
            return;
        }

        // Request tailored CV from background
        console.log('[AI-CV] 📡 Sending optimizeResume message to background...');
        const result = await chrome.runtime.sendMessage({
            action: 'optimizeResume',
            resume: resumeText,
            jobDescription: jd,
            apiToken
        });

        console.log('[AI-CV] 📥 Received response from background:', result);

        if (result.error) throw new Error(result.error);

        // Generate DOCX
        console.log('[AI-CV] 🏗️ Generating DOCX...');
        const doc = generateResume(result.optimizedResume);
        const blob = await window.docx.Packer.toBlob(doc);
        downloadBlobFromContent(blob, result.recomendedFileName || 'tailored-resume.docx');
        console.log('[AI-CV] ✅ CV downloaded successfully.');
    } catch (err) {
        console.error('[AI-CV] ❌ CV download failed:', err.message, err);
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

    console.log('[AI-CV] 🛠️ triggerCoverDownload started');

    try {
        const data = await chrome.storage.local.get(['userToken', 'parsedResume']);
        const apiToken = data.userToken;
        const resumeText = data.parsedResume;
        const jd = window.savedJobDescription;

        console.log('[AI-CV] Data check - Token:', !!apiToken, '| Resume:', !!resumeText, '| JD:', !!jd);

        if (!apiToken || !resumeText || !jd) {
            console.error('[AI-CV] ❌ Missing data for cover letter download. Aborting.');
            return;
        }

        // Request cover letter from background
        console.log('[AI-CV] 📡 Sending generateCoverLetter message to background...');
        const result = await chrome.runtime.sendMessage({
            action: 'generateCoverLetter',
            resume: resumeText,
            jobDescription: jd,
            apiToken
        });

        console.log('[AI-CV] 📥 Received response from background:', result);

        if (result.error) throw new Error(result.error);

        // Generate DOCX
        console.log('[AI-CV] 🏗️ Generating DOCX...');
        const doc = generateCoverLetterDoc(result.coverLetter);
        const blob = await window.docx.Packer.toBlob(doc);
        downloadBlobFromContent(blob, result.recommendedFileName || 'cover-letter.docx');
        console.log('[AI-CV] ✅ Cover letter downloaded successfully.');
    } catch (err) {
        console.error('[AI-CV] ❌ Cover letter download failed:', err.message, err);
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
