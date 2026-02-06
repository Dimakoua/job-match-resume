let floatingButton = null;
let savedJobDescription = null;

function injectFloatingButton() {
    if (floatingButton) return; // Already injected

    // Create the floating button
    floatingButton = document.createElement('div');
    floatingButton.id = 'resume-optimizer-floating-btn';
    floatingButton.innerHTML = `
        <span class="material-symbols-outlined">bookmark_add</span>
    `;
    floatingButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        background-color: #2463eb;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(36, 99, 235, 0.3);
        transition: all 0.2s;
        z-index: 10000;
        font-family: 'Material Symbols Outlined';
        font-size: 24px;
    `;

    // Add hover effect
    floatingButton.onmouseover = () => {
        floatingButton.style.backgroundColor = '#1d4ed8';
        floatingButton.style.transform = 'scale(1.1)';
    };
    floatingButton.onmouseout = () => {
        floatingButton.style.backgroundColor = '#2463eb';
        floatingButton.style.transform = 'scale(1)';
    };

    // Add click handler
    floatingButton.onclick = () => {
        chrome.runtime.sendMessage({
            action: "openPopupAndShowJobSave",
            jobDescription: savedJobDescription
        });
    };

    document.body.appendChild(floatingButton);
}

function removeFloatingButton() {
    if (floatingButton) {
        floatingButton.remove();
        floatingButton = null;
    }
}

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
          const jobDesc = jobElement.innerText.trim();
          sendJobDescription(jobDesc);
          showFloatingButton(jobDesc);
      }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // If the job description is already available, send it immediately
  const existingJobElement = document.querySelector(selector);
  if (existingJobElement) {
      const jobDesc = existingJobElement.innerText.trim();
      sendJobDescription(jobDesc);
      showFloatingButton(jobDesc);
  }
}

function showFloatingButton(jobDescription) {
    savedJobDescription = jobDescription;
    injectFloatingButton();
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
