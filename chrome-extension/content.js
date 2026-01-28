function waitForJobDescription() {
  let selector = null;

  if (window.location.hostname.includes("linkedin")) {
      selector = '*[data-test-job-description-text], .job-details-about-the-job-module__description';
  } 
  else if (window.location.hostname.includes("indeed")) {
      selector = '#jobDescriptionText';
  } 
  else if (window.location.hostname.includes("glassdoor")) {
      selector = "[class*='JobDetails_jobDescription']";
  }

  if (!selector) {
      return;
  }

  const observer = new MutationObserver((mutations, obs) => {
      const jobElement = document.querySelector(selector);
      if (jobElement && jobElement.innerText.trim().length > 0) {
          observer.disconnect(); // Stop observing once we have the job description
          sendJobDescription(jobElement.innerText.trim());
      }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // If the job description is already available, send it immediately
  const existingJobElement = document.querySelector(selector);
  if (existingJobElement) {
      sendJobDescription(existingJobElement.innerText.trim());
  }
}

function sendJobDescription(jobDescription) {
  chrome.runtime.sendMessage({ action: "saveJobDescription", jobDescription });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "getJobDescription") {
      waitForJobDescription();
      sendResponse({ jobDescription: savedJobDescription });
  }
  return true;
});

// Call function to wait for the job description to load
waitForJobDescription();
