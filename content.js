// Function to extract job description
function extractJobDescription() {
    let jobDescription = "Job description not found.";
    const url = window.location.href;
  
    if (url.includes("linkedin.com")) {
      jobDescription = document.querySelector(".description__text")?.innerText || jobDescription;
    } else if (url.includes("indeed.com")) {
      jobDescription = document.querySelector(".jobsearch-jobDescriptionText")?.innerText || jobDescription;
    } else if (url.includes("glassdoor.com")) {
      jobDescription = document.querySelector(".jobDescriptionContent")?.innerText || jobDescription;
    }
  
    return jobDescription;
  }
  
  // Listen for message from popup.js to get job description
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyJobDescription") {
      const jobDescription = extractJobDescription();
      sendResponse({ jobDescription });
    }
  });
  