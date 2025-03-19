console.log("Content script loaded");

// Function to extract job descriptions dynamically
function getJobDescription() {
    if (window.location.hostname.includes("linkedin")) {
        const jobDescription = document.querySelector('*[data-test-job-description-text]') || 
                               document.querySelector('.job-details-jobs-unified-top-card__job-description');
        return jobDescription ? jobDescription.innerText.trim() : 'Job description not found.';
    } 
    if (window.location.hostname.includes("indeed")) {
        const jobDescription = document.querySelector('.jobsearch-jobDescriptionText');
        return jobDescription ? jobDescription.innerText.trim() : 'Job description not found.';
    } 
    if (window.location.hostname.includes("glassdoor")) {
        const jobDescription = document.querySelector('.jdDescription');
        return jobDescription ? jobDescription.innerText.trim() : 'Job description not found.';
    }
    return 'Job description not found.';
}

// Use a MutationObserver to detect when job descriptions load dynamically
const observer = new MutationObserver(() => {
    console.log("Job description content updated");
});
observer.observe(document.body, { childList: true, subtree: true });

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("content.js: message received", message);
    if (message.action === 'getJobDescription') {
        const jobDescription = getJobDescription();
        sendResponse({ jobDescription });
    }
    return true; // Keep the message channel open
});
