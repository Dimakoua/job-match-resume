function getJobDescription() {
    let jobDescription = 'Job description not found.';

    if (window.location.hostname.includes("linkedin")) {
        jobDescription = document.querySelector('*[data-test-job-description-text]') || 
                               document.querySelector('.job-details-jobs-unified-top-card__job-description');
    } 
    if (window.location.hostname.includes("indeed")) {
        jobDescription = document.querySelector('.jobsearch-jobDescriptionText');
    } 
    if (window.location.hostname.includes("glassdoor")) {
        jobDescription = document.querySelector('.jdDescription');
    }
    if (window.location.hostname.includes("mozilla")) {
        jobDescription = document.querySelector('.section-content');
    }

    // Extract text content if element exists
    jobDescription = jobDescription ? jobDescription.innerText.trim() : 'Job description not found.';

    // Send message to popup.js
    chrome.runtime.sendMessage({ action: "saveJobDescription", jobDescription });
}

// Call the function to send job description when content script runs
getJobDescription();
