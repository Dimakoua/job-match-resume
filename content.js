function waitForJobDescription() {
  console.log("Content script running...");
  console.log("Hostname:", window.location.hostname);
  
  let selector = null;

  if (window.location.hostname.includes("linkedin")) {
      selector = '*[data-test-job-description-text], .job-details-about-the-job-module__description';
  } 
  else if (window.location.hostname.includes("indeed")) {
      selector = '.jobsearch-jobDescriptionText';
  } 
  else if (window.location.hostname.includes("glassdoor")) {
      selector = '.jdDescription';
  }
  else if (window.location.hostname.includes("mozilla")) {
      selector = '.section-content';
  }

  if (!selector) {
      console.log("No valid job description selector found for this site.");
      return;
  }

  const observer = new MutationObserver((mutations, obs) => {
      const jobElement = document.querySelector(selector);
      if (jobElement && jobElement.innerText.trim().length > 0) {
          console.log("Job description found!");
          observer.disconnect(); // Stop observing once we have the job description
          sendJobDescription(jobElement.innerText.trim());
      }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // If the job description is already available, send it immediately
  const existingJobElement = document.querySelector(selector);
  if (existingJobElement) {
      console.log("Job description already available.");
      sendJobDescription(existingJobElement.innerText.trim());
  }
}

function sendJobDescription(jobDescription) {
  chrome.runtime.sendMessage({ action: "saveJobDescription", jobDescription });
}

// Call function to wait for the job description to load
waitForJobDescription();
