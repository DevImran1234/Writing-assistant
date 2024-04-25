document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('api-key');

    // Load API key from local storage and set it to the input field
    chrome.storage.local.get('apiKey', function(data) {
        const apiKey = data.apiKey || '';
        apiKeyInput.value = apiKey;
    }); 

    apiKeyInput.addEventListener('input', function() {
        const apiKey = apiKeyInput.value.trim();
        chrome.storage.local.set({ 'apiKey': apiKey }, function() {
            console.log('API key stored:', apiKey);
        });
    });
});
