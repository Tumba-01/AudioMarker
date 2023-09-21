let recognition = null;
const numbersList = [5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 71, 83, 107, 110, 111, 115, 122, 123, 124, 125, 126];
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

let isListening = false; // Track the listening state

// Create a function to toggle recognition on/off
function toggleRecognition() {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
        recognition.lang = 'en-US'; // Set the language (you can change it)

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            document.getElementById('output').innerText = 'Result received: ' + result;
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

document.getElementById('start-recognition').addEventListener('click', toggleRecognition);

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
        }
    }
}
