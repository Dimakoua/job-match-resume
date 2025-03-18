
console.log("Content script loaded");
// content.js
function getJobDescriptionFromLinkedIn() {
  const jobDescription = document.querySelector('.job-details-about-the-job-module__description');
  console.log(jobDescription);
  return jobDescription ? jobDescription.innerText : 'Job description not found.';
}

function getJobDescriptionFromIndeed() {
  const jobDescription = document.querySelector('.jobsearch-jobDescriptionText');
  return jobDescription ? jobDescription.innerText : 'Job description not found.';
}

function getJobDescriptionFromGlassdoor() {
  const jobDescription = document.querySelector('.jdDescription');
  return jobDescription ? jobDescription.innerText : 'Job description not found.';
}

// Check the current website and scrape job description accordingly
let jobDescription = '';

if (window.location.hostname.includes("linkedin")) {
  jobDescription = getJobDescriptionFromLinkedIn();
} else if (window.location.hostname.includes("indeed")) {
  jobDescription = getJobDescriptionFromIndeed();
} else if (window.location.hostname.includes("glassdoor")) {
  jobDescription = getJobDescriptionFromGlassdoor();
}

// Send the job description to the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("content.js: message received", message);
  if (message.action === 'getJobDescription') {
    sendResponse({ jobDescription });
  }

  return true;
});
