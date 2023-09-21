let recognition = null;
const numbersList = [5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 71, 83, 107, 110, 111, 115, 122, 123, 124, 125, 126, 55];
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

let isListening = false; // Track the listening state
let isEnglish = true; // Track the language state

// Create a function to toggle recognition on/off
function toggleRecognition() {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            document.getElementById('output').innerText = result;
            markNumberAsChecked(result);
        };

        recognition.onend = () => {
            if (isListening) {
                // If still in listening state, restart recognition
                recognition.start();
            }
        };
    }

    if (!isListening) {
        recognition.lang = isEnglish ? 'en-US' : 'de-DE'; // Set the language based on the language state
        recognition.start();
        isListening = true;
    } else {
        recognition.stop();
        isListening = false;
    }

    // Toggle the button text
    const startButton = document.getElementById('start-recognition');
    startButton.innerText = isListening ? 'Stop Recognition' : 'Start Recognition';
}

// Create a function to toggle between English and German
function toggleLanguage() {
    isEnglish = !isEnglish; // Toggle the language state

    // Get the language-toggle button element
    const languageToggleButton = document.getElementById('language-toggle');

    // Update the button text based on the language state
    languageToggleButton.innerText = isEnglish ? 'Change the language to German' : 'Sprache wechseln auf Englisch';

    // Set the recognition language if listening is active
    if (isListening) {
        recognition.lang = isEnglish ? 'en-US' : 'de-DE'; // Set the language based on the language state
    }
}

// Add a click event listener to the "start-recognition" button
document.getElementById('start-recognition').addEventListener('click', toggleRecognition);

// Add a click event listener to the "language-toggle" button
document.getElementById('language-toggle').addEventListener('click', toggleLanguage);

function markNumberAsChecked(text) {
    // Use a regular expression to search for numbers in the text
    const numbers = text.match(/\d+/g);

    // Iterate through the extracted numbers and check if they match any numbers from the list
    if (numbers) {
        for (const numberStr of numbers) {
            const number = parseInt(numberStr);
            if (!isNaN(number) && numbersList.includes(number)) {
                const checkbox = document.getElementById('check-' + number);
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                }
            }
            
            // Check for "55" and also tick the checkbox for "5"
            if (number === 55) {
                const checkbox5 = document.getElementById('check-5');
                if (checkbox5 && !checkbox5.checked) {
                    checkbox5.checked = true;
                }
            }
        }
    }
}

// Add this event listener for the reset button
document.getElementById('reset-checkboxes').addEventListener('click', () => {
    // Loop through the checkboxes and uncheck them
    for (const number of numbersList) {
        const checkbox = document.getElementById('check-' + number);
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            checkbox.removeAttribute('data-number-text');
        }
    }
});

// Get a reference to the modal element and body
const workaroundModal = document.getElementById('workaround-modal');
const body = document.body;

// Function to open the modal
function openWorkaroundModal() {
    workaroundModal.showModal();

    // Disable scrolling
    body.classList.add('modal-open');
}

// Function to close the modal
function closeWorkaroundModal() {
    workaroundModal.close();

    // Enable scrolling
    body.classList.remove('modal-open');
}

// Call the openWorkaroundModal function when the page loads
window.addEventListener('load', openWorkaroundModal);

// Close the modal when the "OK" button is clicked
document.getElementById('workaround-modal-button').addEventListener('click', closeWorkaroundModal);

