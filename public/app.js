function loadSettings() {
  const aiModelSelect = document.getElementById("aiModel");
  const userTokenInput = document.getElementById("userToken");

  const savedAiModel = localStorage.getItem("aiModel") || "gemini";
  const savedUserToken = localStorage.getItem("userToken") || "";

  aiModelSelect.value = savedAiModel;
  userTokenInput.value = savedUserToken;

  return {
    aiModel: savedAiModel,
    userToken: savedUserToken
  };
}

function toggleAISettings() {
  const AISettingsForm = document.getElementById("AISettingsForm");
  AISettingsForm.classList.toggle("hidden");
}

function saveSettings() {
  const aiModel = document.getElementById("aiModel").value;
  const userToken = document.getElementById("userToken").value.trim();

  if (!aiModel || !userToken) {
    showMessage("error", "Select AI model and paste the token.");
    return;
  }

  localStorage.setItem("aiModel", aiModel);
  localStorage.setItem("userToken", userToken);

  showMessage("success", "AI settings saved.");
  toggleAISettings();
}

function showMessage(type, text, timeout = 3500) {
  const messageBox = document.getElementById("messageBox");

  if (!messageBox) {
    console.warn("Message box is missing.");
    return;
  }

  const message = document.createElement("div");
  message.className = type === "success" ? "success-message" : "error-message";
  message.textContent = text;
  messageBox.appendChild(message);

  setTimeout(() => {
    message.classList.add("fade-out");
    message.addEventListener("animationend", () => {
      message.remove();
    });
  }, timeout);
}

function toggleLoader(show) {
  const loader = document.getElementById("loader");
  const button = document.getElementById("optimizeResume");

  if (show) {
    loader.classList.remove("hidden");
    button.disabled = true;
    button.classList.add("disabled");
  } else {
    loader.classList.add("hidden");
    button.disabled = false;
    button.classList.remove("disabled");
  }
}

function loadCV() {
  const parsedResume = localStorage.getItem("parsedResume");
  if (parsedResume) {
    document.getElementById("resume").value = parsedResume;
  }
}

function updateResumeContent(content) {
  const resumeInput = document.getElementById("resume");
  resumeInput.value = content;
  localStorage.setItem("parsedResume", content);
}

async function optimizeResume() {
  const resumeInput = document.getElementById("resume");
  const jobDescriptionInput = document.getElementById("jobDescription");
  const settings = loadSettings();

  const resumeText = resumeInput.value.trim();
  const jobDescriptionText = jobDescriptionInput.value.trim();

  if (!resumeText || !jobDescriptionText) {
    showMessage("error", "Please provide both resume and job description.");
    return;
  }

  if (!settings.userToken) {
    showMessage("error", "Please save the AI token under settings.");
    return;
  }

  toggleLoader(true);

  try {
    const response = await fetch("/api/optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        resumeText,
        jobDescription: jobDescriptionText,
        ai: {
          model: settings.aiModel,
          token: settings.userToken
        }
      })
    });

    const payload = await response.json();

    if (!response.ok || payload?.message) {
      throw new Error(payload?.message || "The AI service could not process the request.");
    }

    if (!payload.optimizedResume || Object.keys(payload.optimizedResume).length === 0) {
      showMessage("error", "AI response is missing the optimized resume.");
      return;
    }

    displayATSScore(payload.ATSCompatibilityScore || 0);
    showExplanation(payload.explanation);
    generateDocx(payload);
    showMessage("success", "Resume optimized successfully!");
  } catch (error) {
    console.error(error);
    showMessage("error", `Optimization failed: ${error.message}`);
  } finally {
    toggleLoader(false);
  }
}

function showExplanation(text = "") {
  const explanation = document.getElementById("explanation");
  explanation.textContent = text || "The AI did not return an explanation.";

  document.getElementById("resultExplanation").classList.remove("hidden");
}

function setATSScore(percent = 0) {
  const circle = document.querySelector(".progress-circle");
  const text = document.querySelector(".progress-text");
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  circle.style.strokeDashoffset = offset;
  text.textContent = `${percent}/100`;
}

function displayATSScore(score) {
  const numericScore = Number(score) || 0;
  setATSScore(numericScore);
  document.getElementById("atsScore").classList.remove("hidden");
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const fileType = file.type;

  if (fileType === "text/plain") {
    const reader = new FileReader();
    reader.onload = (event) => updateResumeContent(event.target.result);
    reader.readAsText(file);
  } else if (fileType === "application/pdf") {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const pdfData = new Uint8Array(event.target.result);
      await parsePDF(pdfData);
    };
    reader.readAsArrayBuffer(file);
  } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const reader = new FileReader();
    reader.onload = (event) => parseDOCX(event.target.result);
    reader.readAsArrayBuffer(file);
  } else {
    showMessage("error", "Unsupported file type.");
  }
}

async function parsePDF(pdfData) {
  try {
    const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
    const totalPages = pdfDoc.numPages;
    const pagePromises = [];

    for (let i = 1; i <= totalPages; i += 1) {
      pagePromises.push(
        pdfDoc.getPage(i).then(async (page) => {
          const text = await page.getTextContent();
          return text.items.map((item) => item.str).join(" ");
        })
      );
    }

    const allText = await Promise.all(pagePromises);
    updateResumeContent(allText.join("\n"));
  } catch (error) {
    console.error("PDF parsing error", error);
    showMessage("error", "Failed to parse PDF file.");
  }
}

function parseDOCX(arrayBuffer) {
  mammoth
    .extractRawText({ arrayBuffer })
    .then((result) => updateResumeContent(result.value))
    .catch((err) => {
      console.error("DOCX parsing error", err);
      showMessage("error", "Unable to parse the DOCX file.");
    });
}

function generateDocx(jsonData) {
  const document = generateResume(jsonData.optimizedResume);
  Packer.toBlob(document).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = jsonData.recomendedFileName || "optimized_resume.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadCV();

  document.getElementById("showAISettingsForm").addEventListener("click", toggleAISettings);
  document.getElementById("saveAISettings").addEventListener("click", saveSettings);
  document.getElementById("optimizeResume").addEventListener("click", optimizeResume);
  document.getElementById("resumeFile").addEventListener("change", handleFileUpload);
});
