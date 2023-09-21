let recognition = null;
const numbersList = [5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 71, 83, 107, 110, 111, 115, 122, 123, 124, 125, 126];
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

document.getElementById('start-recognition').addEventListener('click', () => {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
        recognition.lang = 'en-US'; // Set the language (you can change it)

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            document.getElementById('output').innerText = 'Result received: ' + result;
            markNumberAsChecked(result);
            // Continue recognition after a short delay to capture the next result
            setTimeout(() => {
                recognition.start();
            }, 100);
        };
    }

    document.getElementById('start-recognition').style.display = 'none';
    document.getElementById('stop-recognition').style.display = 'block';
    recognition.start();
});

document.getElementById('stop-recognition').addEventListener('click', () => {
    if (recognition) {
        recognition.stop();
    }
    document.getElementById('start-recognition').style.display = 'block';
    document.getElementById('stop-recognition').style.display = 'none';
});

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
