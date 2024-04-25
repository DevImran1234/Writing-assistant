function createButtons() {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'writing-assistant-buttons';
    buttonsContainer.style.position = 'absolute';
    buttonsContainer.style.zIndex = '9999';
    buttonsContainer.style.background = 'transparent';
    // buttonsContainer.style.border = '1px solid #ccc';
    buttonsContainer.style.borderRadius = '4px';
    buttonsContainer.style.padding = '8px';

    const buttonStyle = `
        background-color: black;
        color: #fff;
        border: none;
        border-radius: 100px;
        padding: 6px;
        margin-right: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    `;

    // Function to handle hover effect on buttons
    function handleButtonHover(event) {
        event.target.style.backgroundColor = ' #007bff'; // Change background color on hover
    }

    // Function to handle removing hover effect on buttons
    function handleButtonUnhover(event) {
        event.target.style.backgroundColor = 'black'; // Revert background color on hover out
    }

    const rewriteBtn = document.createElement('button');
    rewriteBtn.textContent = 'Rewrite';
    rewriteBtn.style.cssText = buttonStyle;
    rewriteBtn.addEventListener('click', rewriteText);
    rewriteBtn.addEventListener('mouseenter', handleButtonHover); // Add hover effect
    rewriteBtn.addEventListener('mouseleave', handleButtonUnhover); // Remove hover effect

    const rephraseBtn = document.createElement('button');
    rephraseBtn.textContent = 'Rephrase';
    rephraseBtn.style.cssText = buttonStyle;
    rephraseBtn.addEventListener('click', rephraseText);
    rephraseBtn.addEventListener('mouseenter', handleButtonHover); // Add hover effect
    rephraseBtn.addEventListener('mouseleave', handleButtonUnhover); // Remove hover effect

    const shortenBtn = document.createElement('button');
    shortenBtn.textContent = 'Shorten';
    shortenBtn.style.cssText = buttonStyle;
    shortenBtn.addEventListener('click', shortenText);
    shortenBtn.addEventListener('mouseenter', handleButtonHover); // Add hover effect
    shortenBtn.addEventListener('mouseleave', handleButtonUnhover); // Remove hover effect

    buttonsContainer.appendChild(rewriteBtn);
    buttonsContainer.appendChild(rephraseBtn);
    buttonsContainer.appendChild(shortenBtn);

    return buttonsContainer;
}

let timer;

function showButtonsAboveActiveElement() {
    clearTimeout(timer);
    timer = setTimeout(function() {
        removeButtons();
        const activeElement = document.activeElement;
        const rect = activeElement.getBoundingClientRect();
        const buttonsContainer = createButtons();

        // Calculate the position of the buttons relative to the active element
        const top = rect.top + window.pageYOffset - buttonsContainer.offsetHeight - 10;
        const left = rect.left + window.pageXOffset + (rect.width - buttonsContainer.offsetWidth) / 2;

        // Position the button container
        buttonsContainer.style.top = `${top}px`;
        buttonsContainer.style.left = `${left}px`;

        // Insert the button container into the document
        document.body.appendChild(buttonsContainer);
    }, 200); // Adjust the delay as needed (200 milliseconds in this example)
}



// Remove buttons when text is not selected
function removeButtons() {
    const buttonsContainer = document.getElementById('writing-assistant-buttons');
    if (buttonsContainer) {
        buttonsContainer.remove();
    }
}

// Listen for text selection events
document.addEventListener('selectionchange', function(event) {
    const selection = window.getSelection();
    if (selection.toString().trim() !== '') {
       showButtonsAboveActiveElement();
    } else {
        removeButtons();
    }
});
document.addEventListener('input', function(event) {
    const element = event.target;
    if (element.tagName.toLowerCase() === 'textarea' || element.isContentEditable) {
        if (element.value.trim() === '') {
            removeButtons();
        }
    }
});

// Listen for mouse events to remove buttons when clicking outside the selection
document.addEventListener('mousedown', function(event) {
    const buttonsContainer = document.getElementById('writing-assistant-buttons');
    if (buttonsContainer && !buttonsContainer.contains(event.target)) {
        removeButtons();
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "rewrite") {
        rewriteText();
    } else if (request.action == "rephrase") {
        rephraseText();
    } else if (request.action == "shorten") {
        shortenText();
    }
});

function rewriteText() {
    // Fetch the selected text from the webpage
    var selectedText = window.getSelection().toString();

    // Send request to background script to interact with the OpenAI API
    chrome.runtime.sendMessage({ action: "rewrite", text: selectedText }, function(response) {
        if(response !== "") {
            updateSelection(response);
            removeButtons();
        }
    });
}

function rephraseText() {
    // Fetch the selected text from the webpage
    var selectedText = window.getSelection().toString();
    
    // Send request to background script to interact with the OpenAI API
    chrome.runtime.sendMessage({ action: "rephrase", text: selectedText }, function(response) {
        if(response !== "") {
            updateSelection(response);
            removeButtons();
        }
    });
}

function shortenText() {
    // Fetch the selected text from the webpage
    var selectedText = window.getSelection().toString();

    // Send request to background script to interact with the OpenAI API
    chrome.runtime.sendMessage({ action: "shorten", text: selectedText }, function(response) {
        if(response !== "") {
            updateSelection(response);
            removeButtons();
          
        }
    });
}

function updateSelection(modifiedText) {
    const textarea = document.activeElement;
    if (textarea.tagName.toLowerCase() === 'textarea') {
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const value = textarea.value;
        const newValue = value.substring(0, selectionStart) + modifiedText + value.substring(selectionEnd);
        textarea.value = newValue;
        textarea.selectionStart = selectionStart + modifiedText.length;
        textarea.selectionEnd = selectionStart + modifiedText.length;
    } else {
        // If active element is not a textarea, try to find the first textarea in the document
        const textareas = document.getElementsByTagName('textarea');
        if (textareas.length > 0) {
            const firstTextarea = textareas[0];
            const selectionStart = firstTextarea.selectionStart;
            const selectionEnd = firstTextarea.selectionEnd;
            const value = firstTextarea.value;
            const newValue = value.substring(0, selectionStart) + modifiedText + value.substring(selectionEnd);
            firstTextarea.value = newValue;
            firstTextarea.selectionStart = selectionStart + modifiedText.length;
            firstTextarea.selectionEnd = selectionStart + modifiedText.length;
        } else {
            updateSection(modifiedText);
        } 
    }
}


function updateSection(modifiedText) {
    const selection = window.getSelection();
      
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(modifiedText));
    } else {
        console.error("Error: No text selected.");
    }
}
