// Function to load saved settings from localStorage
function loadSettings() {
    const aiModelSelect = document.getElementById('aiModel');
    const userTokenInput = document.getElementById('userToken');

    const savedAiModel = localStorage.getItem('aiModel');
    const savedUserToken = localStorage.getItem('userToken');

    if (savedAiModel) {
        aiModelSelect.value = savedAiModel;
    }
    if (savedUserToken) {
        userTokenInput.value = savedUserToken;
    }

    if (savedAiModel && savedUserToken) {
        // Hide the form if both settings are saved
        const AISettingsForm = document.getElementById('AISettingsForm');
        AISettingsForm.classList.add('hidden');
    }
}

// Function to save settings to localStorage
function saveSettings() {
    const aiModelSelect = document.getElementById('aiModel');
    const userTokenInput = document.getElementById('userToken');
    const successMessage = document.getElementById('successMessage');
    const AISettingsForm = document.getElementById('AISettingsForm');

    const aiModel = aiModelSelect.value;
    const userToken = userTokenInput.value;

    // Store settings in localStorage
    localStorage.setItem('aiModel', aiModel);
    localStorage.setItem('userToken', userToken);

    // Show success message and hide the form
    successMessage.classList.remove('hidden');
    AISettingsForm.classList.add('hidden');

    // Optionally hide success message after a few seconds
    setTimeout(function () {
        successMessage.classList.add('hidden');
    }, 3000);
}

function tryParseJobDescription() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getJobDescription' }, function (response) {
            console.log(response)
            if (response && response.jobDescription) {
                // parsedJobDescription.textContent = response.jobDescription;
            } else {
                // parsedJobDescription.textContent = 'Could not find job description.';
            }
        });
    });
}




// Event listener for Save button
document.addEventListener('DOMContentLoaded', function () {
    // Load saved settings on page load
    loadSettings();
    tryParseJobDescription();

    const saveAISettingsBtn = document.getElementById('saveAISettings');
    const showAISettingsForm = document.getElementById('showAISettingsForm');


    // Save settings when the save button is clicked
    saveAISettingsBtn.addEventListener('click', function () {
        saveSettings();
    });
    // Save settings when the save button is clicked
    showAISettingsForm.addEventListener('click', function () {
        const AISettingsForm = document.getElementById('AISettingsForm');
        AISettingsForm.classList.toggle('hidden');
    });
});
