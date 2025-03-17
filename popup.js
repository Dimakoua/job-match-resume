let jobDescription = ''; // Initialize jobDescription variable

// Capture job description from the current page
document.getElementById("optimizeButton").addEventListener("click", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "copyJobDescription" }, function(response) {
      if (response && response.jobDescription) {
        jobDescription = response.jobDescription; // Store the job description
        document.getElementById("jobDescription").value = jobDescription;
      } else {
          console.log("Error extracting job description.");
          console.log("VALUE", document.getElementById("jobDescription").value)
      }
    });
  });
});

// Handle file upload for resume
document.getElementById("resumeUpload").addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
    console.log("file uploaded");
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;

            // Ensure jobDescription is available before sending the request
            if (!jobDescription) {
                jobDescription = document.getElementById("jobDescription").value;
                // alert("Please capture the job description first.");
                // return;
            }
            if (!jobDescription) {
                alert("Please capture the job description first.");
                return;
            }

            // Send both the resume content and job description to the background script
            chrome.runtime.sendMessage(
                { action: "parseResume", fileContent, jobDescription },
                (response) => {
                    if (response.optimizedText) {
                        document.getElementById("optimizedResume").innerText = response.optimizedText;
                        console.log(response.optimizedText);
                    } else {
                        alert("Error optimizing resume.");
                    }
                }
            );
        };
        reader.readAsText(file);
    } else {
        alert("Please upload a TXT file.");
    }
}
