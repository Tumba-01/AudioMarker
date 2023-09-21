let recognition = null;
const numbersList = [5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35, 71, 83, 107, 110, 111, 115, 122, 123, 124, 125, 126];

// Mapping of numbers to their written representation
const numberToText = {
    5: "five",
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
    20: "twenty",
    21: "twenty-one",
    25: "twenty-five",
    26: "twenty-six",
    27: "twenty-seven",
    28: "twenty-eight",
    29: "twenty-nine",
    30: "thirty",
    31: "thirty-one",
    33: "thirty-three",
    34: "thirty-four",
    35: "thirty-five",
    71: "seventy-one",
    83: "eighty-three",
    107: "one hundred seven",
    110: "one hundred ten",
    111: "one hundred eleven",
    115: "one hundred fifteen",
    122: "one hundred twenty-two",
    123: "one hundred twenty-three",
    124: "one hundred twenty-four",
    125: "one hundred twenty-five",
    126: "one hundred twenty-six"
};

document.getElementById('start-recognition').addEventListener('click', () => {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
        recognition.lang = 'en-US'; // Set the language (you can change it)

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            document.getElementById('output').innerText = 'Result received: ' + result;
            markNumberAsChecked(result);
            // Continue recognition without delay to capture the next result
            recognition.start();
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
                    const numberText = numberToText[number];
                    checkbox.setAttribute('data-number-text', numberText);
                }
            }
        }
    }
}
