chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "rewrite") {
        sendRequestToOpenAI(request.text, "rewrite", sendResponse);
    } else if (request.action == "rephrase") {
        sendRequestToOpenAI(request.text, "rephrase", sendResponse);
    } else if (request.action == "shorten") {
        sendRequestToOpenAI(request.text, "shorten", sendResponse);
    }
    return true;
});

function sendRequestToOpenAI(text, task, sendResponse) {
    chrome.storage.local.get('apiKey', function(data) {
        const apiKey = data.apiKey;
        if (!apiKey) {
            console.error("Error: API key not found.");
            sendResponse("");
            return;
        }

        var models = {
            rewrite: "gpt-3.5-turbo-instruct",
            rephrase: "gpt-3.5-turbo-instruct",
            shorten: "gpt-3.5-turbo-instruct"
        };

        var prompts = {
            rewrite: `Rewrite the following text: "${text}"`,
            rephrase: `Rephrase the following text: "${text}"`,
            shorten: `Shorten the following text: "${text}"`
        };

        var requestBody = {
            model: models[task],
            prompt: prompts[task],
            max_tokens: 100 
        };

        var apiUrl = "https://api.openai.com/v1/completions";

        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            if (data.choices && data.choices.length > 0) {
                var modifiedText = data.choices[0].text.trim();
                sendResponse(modifiedText);
            } else {
                console.error("Error: No response from OpenAI API.");
                sendResponse("");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            sendResponse("");
        });
    });
}
