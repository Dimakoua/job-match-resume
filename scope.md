# Project Overview: AI Resume Optimizer Chrome Extension

## 1. Executive Summary
AI Resume Optimizer is a completely free, 100% client-side Chrome Extension designed to help job seekers instantly tailor their resumes (CVs) and generate custom cover letters based on the specific job description they are viewing. By injecting a seamless UI directly into popular job boards (like LinkedIn and Indeed), the extension removes the friction of copy-pasting information between tabs. It operates on a "Bring Your Own Key" (BYOK) model, utilizing the user's personal Google AI API key to ensure zero server costs and maximum user privacy.

## 2. Context & Problem Statement
* **The Problem:** Job seekers are advised to tailor their CVs and cover letters for every application to pass Applicant Tracking Systems (ATS). Doing this manually is incredibly time-consuming. While AI tools (like ChatGPT or Gemini) exist, they require users to constantly context-switch: copying job descriptions, pasting them into a separate AI tab, fetching their base resume, and prompting the AI.
* **The Solution:** Bring the AI directly to the job board. By injecting a widget right next to the native "Apply" buttons, users can generate highly targeted application materials in one click, without ever leaving the page.

## 3. Core Architecture
* **Zero-Backend Infrastructure:** All logic, data processing, and API calls occur entirely on the client side (within the user's browser).
* **BYOK Model:** The user generates a free Google AI API key and inputs it into the extension during onboarding.
* **Privacy-First:** User data (Base CV, API key, generated documents) is stored strictly in `chrome.storage.local`. No data is ever transmitted to a third-party server (other than the direct API call to Google).

## 4. Project Scope

### In-Scope
* **Extension Onboarding Popup:** UI for capturing the user's Google AI API key and uploading/pasting their "Base CV".
* **Content Injection:** Dynamically injecting a floating "Tailor Application" widget near the "Apply" buttons on supported domains (LinkedIn, Indeed).
* **DOM Scraping:** Extracting the Job Title, Company, and Job Description from the current webpage.
* **Side-Panel / Overlay UI:** A generation hub displaying AI progress, a Keyword Match Score (missing vs. matched keywords), and document previews.
* **AI Integration:** Formulating optimized prompts combining the Base CV and Job Description, and executing REST API calls to Google's Gemini models from the client.
* **Export Functionality:** Copy to clipboard and simple document download (.TXT or Client-Side PDF generation).

### Out-of-Scope
* **Backend Database / Server:** No user accounts, cloud syncing, or hosted databases.
* **Monetization / Subscriptions:** The tool is explicitly 100% free; no payment gateways (Stripe) integration.
* **Automated Applying:** The extension will *not* automatically click "Apply" or fill out form fields on the job board. It strictly generates the content for the user to use.
