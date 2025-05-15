# Privacy Policy for AI Resume Optimizer

**Last Updated:** 15 May 2025

Thank you for using AI Resume Optimizer ("the Extension"), provided by kodim.developer ("we," "us," or "our"). This Privacy Policy explains how we collect, use, and disclose information when you use our Chrome extension.

By using the Extension, you agree to the collection and use of information in accordance with this policy.

## 1. Information We Collect

The Extension is designed to help you optimize your resume to match job descriptions using Artificial Intelligence (AI). To provide this service, we may collect and process the following types of information:

**a) Information You Provide Directly:**

*   **Resume Content:** When you upload your resume (e.g., as a PDF or text file) or paste its content into the Extension, we process this information. This may include personally identifiable information (PII) such as your name, contact details, work history, education, and skills.
*   **API Keys:** To use AI services (such as Google Gemini, OpenAI GPT, Anthropic Claude, or other similar services you choose to configure), you will need to provide your own API key for the selected service. These API keys are stored locally in your browser's storage.
*   **Job Description Content:** You may paste job description text into the Extension, or the Extension may help you extract it from web pages.

**b) Information Collected Automatically:**

*   **Job Description Data from Web Pages:** With your explicit action (e.g., clicking a button provided by the Extension on a job posting page), the Extension may use the `scripting` and `activeTab` permissions to access and extract the text content of job descriptions from websites you are currently viewing. The `host_permissions` for `http://*/*` and `https://*/*` are requested to enable this functionality across various job board websites and to communicate with AI service APIs. We only intend to access job description content on pages you actively choose to process.
*   **Usage Data:** We may collect information about how you interact with the Extension, such as the features you use or the AI models you select. This data is primarily used for improving the Extension and is processed locally or in an aggregated, anonymous form if sent for analytics.
*   **Locally Stored Data:** The Extension uses your browser's local storage (`chrome.storage` or `localStorage`) to store your API keys, user preferences (like selected AI model), and potentially temporarily store processed resume or job description content for the duration of your session or as configured.

## 2. How We Use Your Information

We use the collected information for the following purposes:

*   **To Provide and Maintain the Service:**
    *   To process your resume and the job description.
    *   To send your resume content and the job description content to the third-party AI service you have selected and configured with your API key.
    *   To display the AI-generated optimized resume content to you.
*   **To Personalize Your Experience:**
    *   To save your preferences, such as your chosen AI model and API keys, for future use.
*   **To Enable Core Functionality:**
    *   The `activeTab` and `scripting` permissions are used to allow the Extension to interact with the web page you are currently viewing, specifically to extract job description text when you initiate this action.
    *   The `storage` permission is used to save your API keys and settings locally on your device.
    *   The `host_permissions` (`http://*/*`, `https://*/*`) are required to:
        *   Allow content scripts (via programmatic injection using the `scripting` permission) to function on various job board websites to extract job descriptions.
        *   Enable communication from your browser directly to the APIs of the AI services you choose to use (e.g., Google, OpenAI, Anthropic).
*   **Client-Side PDF Processing:**
    *   The Extension includes `libs/pdf.worker.min.js` (part of PDF.js) as a web-accessible resource. This library is used locally within your browser to parse PDF files (your resume) if you upload one. This processing happens entirely on your computer.

## 3. How We Share Your Information

Your privacy is important to us. We do not sell your personal information. We share your information only in the following circumstances:

*   **With Third-Party AI Services:**
    *   When you use the Extension's core functionality, your resume content and the job description content are sent to the third-party AI service (e.g., Google Gemini, OpenAI, Anthropic) that you have selected and for which you have provided an API key.
    *   This data transmission is initiated by you and is necessary for the AI to process the information and provide the optimized resume.
    *   Your use of these third-party AI services is subject to their respective privacy policies and terms of service. We encourage you to review them:
        *   Google: [Link to Google's Privacy Policy]
        *   OpenAI: [Link to OpenAI's Privacy Policy]
        *   Anthropic: [Link to Anthropic's Privacy Policy]
        *   [Add links for any other AI services you might support]
    *   Your API keys for these services are stored locally in your browser and are used to authenticate your requests directly from your browser to the AI service. We do not have access to the actual AI processing beyond initiating the request on your behalf using your key.
*   **Legal Requirements:**
    *   We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).

**We do not store your resume content or job description content on our own servers.** The processing involving AI happens via direct communication between your browser and the third-party AI service you select, using your API key.

## 4. Data Storage and Security

*   **Local Storage:** Your API keys and extension preferences are stored locally in your browser's storage. You are responsible for the security of your API keys.
*   **Data Transmission:** When data is sent to third-party AI services, it is transmitted over HTTPS, provided the AI service supports it (which is standard practice).
*   While we strive to use commercially acceptable means to protect your information, no method of transmission over the Internet or method of electronic storage is 100% secure. Therefore, we cannot guarantee its absolute security.

## 5. Your Rights and Choices

*   **API Keys:** You can choose not to provide API keys, but this will limit the Extension's core AI optimization functionality. You can typically remove or update stored API keys within the Extension's settings.
*   **Data Access and Deletion:** Information like API keys and preferences are stored locally. You can clear your browser's storage for the extension or uninstall the extension to remove this data.
*   **Uninstalling the Extension:** You can uninstall the Extension at any time through your browser's extension management page.

## 6. Children's Privacy

The Extension is not intended for use by children under the age of 13 (or a higher age threshold as required by applicable law). We do not knowingly collect personally identifiable information from children. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take steps to remove that information.

## 7. Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.

## 8. Contact Us

If you have any questions about this Privacy Policy, please contact us:

*   By email: `kodim.developer@gmail.com`
