# Technical Implementation Steps

This document outlines the highly detailed, technical ("tiki") step-by-step implementation guide for building the AI Resume Optimizer Chrome Extension using Manifest V3.


## Phase 2: Onboarding & Local Storage (Popup UI)
1.  **Build Popup UI (`popup.html` / React components):**
    * Create a clean, extension-branded interface.
    * Add a text input for the `Google AI API Key`.
    * Add a `textarea` or file parser (using a lightweight library like `pdf.js` if accepting PDFs, or strictly sticking to text paste for V1) for the `Base CV`.
2.  **Implement Storage Logic:**
    * On submit, validate the API key format (basic string check).
    * Use `chrome.storage.local.set({ apiKey: '...', baseCV: '...' })` to securely store the data.
    * Implement state checking: When the popup opens, check `chrome.storage.local.get`. If the key and CV exist, show a "Ready to browse" state instead of the input forms.

## Phase 3: DOM Injection (Content Scripts)
1.  **Set up `MutationObserver`:**
    * Job boards are Single Page Applications (SPAs). Standard `window.onload` won't work reliably as users navigate.
    * Write a `MutationObserver` in `content.js` that watches the DOM body for the rendering of the specific "Apply" buttons (e.g., `.jobs-apply-button` on LinkedIn).
2.  **Inject the Floating Widget:**
    * Once the native apply button is detected, create a new DOM element (`div`).
    * Attach a Shadow DOM to this `div`. *Crucial step:* Using Shadow DOM (`element.attachShadow({mode: 'open'})`) ensures that LinkedIn/Indeed's global CSS does not break your widget's styling, and your CSS doesn't break the host page.
    * Render your React/Vanilla UI inside the Shadow Root (the "✨ Tailor CV" and "✍️ Write Cover Letter" buttons).

## Phase 4: Job Data Extraction (Scraping)
1.  **Define Selectors:** Maintain a configuration object mapping domains to CSS selectors.
    * *LinkedIn:* `title: '.job-details-jobs-unified-top-card__job-title'`, `description: '#job-details'`.
    * *Indeed:* `title: '.jobsearch-JobInfoHeader-title'`, `description: '#jobDescriptionText'`.
2.  **Extraction Logic:**
    * When the user clicks "Tailor CV" on the injected widget, execute the extraction function based on `window.location.hostname`.
    * Sanitize the extracted text: Strip out excess whitespace, HTML tags, and non-essential boilerplate text to save tokens for the AI prompt.

## Phase 5: The Generation Hub UI (Side Panel/Overlay)
1.  **Render the Sidebar:**
    * *Option A (Native Side Panel):* Send a message to `background.js` to open the Chrome Side Panel (`chrome.sidePanel.open()`).
    * *Option B (In-Page Overlay):* Expand your existing Shadow DOM widget into a sliding right-hand sidebar over the webpage.
2.  **UI State Management:** Initialize the UI in a "Loading/Analyzing" state with a progress bar.

## Phase 6: AI Integration (Google Gemini API)
1.  **Fetch Stored Data:** Retrieve `apiKey` and `baseCV` from `chrome.storage.local`.
2.  **Construct the Prompt:** Create a highly structured prompt. Example template:
    ```text
    Act as an expert career coach. I will provide my Base CV and a Job Description. 
    1. Extract the top 5 missing keywords from my CV that appear in the job description.
    2. Rewrite my Professional Summary and recent Work Experience to highlight these keywords and align perfectly with the role. Do not invent fake experience; reframe existing experience.
    3. Return the response in strictly formatted JSON:
    { "matchScore": Number, "missingKeywords": [String], "tailoredCV": "Markdown String" }
    ```
3.  **Execute Client-Side API Call:**
    * Use the native `fetch` API.
    * Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    * Ensure proper error handling (e.g., catching 401 Unauthorized if the API key is invalid, or 429 if rate-limited).

## Phase 7: Data Rendering & Export
1.  **Parse AI Response:** Parse the JSON response from Gemini.
2.  **Update UI:**
    * Bind the `matchScore` and `missingKeywords` to the Analytics Card UI.
    * Render the `tailoredCV` markdown into the content box using a library like `marked.js` or `react-markdown`.
3.  **Implement Export:**
    * *Copy to Clipboard:* Use `navigator.clipboard.writeText()`.
    * *TXT Download:* Create a Blob from the text, generate an Object URL (`URL.createObjectURL(blob)`), and trigger a hidden `<a download="Tailored_CV.txt">` click.
