let recognition = null;
const numbersList = [2, 12, 59, 61, 62, 64, 65, 68, 70, 72, 86, 87, 95, 96, 97, 98, 99, 105, 106, 109, 110, 173, 186, 187];
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

let isListening = false;
let isEnglish = true;
let pendingExportType = null; // 'json' or 'pdf'

// --- Word-to-number mapping ---
const wordToNumber = {
    'one': 1, 'won': 1,
    'two': 2, 'to': 2, 'too': 2,
    'three': 3,
    'four': 4, 'for': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8, 'ate': 8,
    'nine': 9,
    'ten': 10,
    'eleven': 11,
    'twelve': 12,
    'thirteen': 13,
    'fourteen': 14,
    'fifteen': 15,
    'sixteen': 16,
    'seventeen': 17,
    'eighteen': 18,
    'nineteen': 19,
    'twenty': 20,
    'thirty': 30,
    'forty': 40, 'fourty': 40,
    'fifty': 50,
    'sixty': 60,
    'seventy': 70,
    'eighty': 80,
    'ninety': 90,
    'hundred': 100,
    'ein': 1, 'eins': 1, 'zwei': 2, 'drei': 3, 'vier': 4, 'fünf': 5,
    'sechs': 6, 'sieben': 7, 'acht': 8, 'neun': 9, 'zehn': 10,
    'elf': 11, 'zwölf': 12, 'dreizehn': 13, 'vierzehn': 14,
    'fünfzehn': 15, 'sechzehn': 16, 'siebzehn': 17, 'achtzehn': 18,
    'neunzehn': 19, 'zwanzig': 20, 'dreißig': 30, 'vierzig': 40,
    'fünfzig': 50, 'sechzig': 60, 'siebzig': 70, 'achtzig': 80,
    'neunzig': 90, 'hundert': 100
};

function normalizeTranscript(text) {
    return text.toLowerCase().split(/\s+/).map(word => {
        return wordToNumber[word] !== undefined ? wordToNumber[word] : word;
    }).join(' ');
}

// --- Progress bar ---
function updateProgress() {
    const total = numbersList.length;
    const checked = numbersList.filter(n => {
        const cb = document.getElementById('check-' + n);
        return cb && cb.checked;
    }).length;

    document.getElementById('progress-label').innerText = `${checked} / ${total} checked`;
    document.getElementById('progress-bar-fill').style.width = `${(checked / total) * 100}%`;
    document.getElementById('progress-bar-fill').style.background =
        checked === total
            ? 'linear-gradient(90deg, #f5c400, #ffe066)'
            : 'linear-gradient(90deg, #35D49F, #05EB20)';
}

// --- Haptic feedback ---
function vibrate() {
    if ('vibrate' in navigator) navigator.vibrate(50);
}

// --- Audio feedback ---
function playSuccessSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.4);
}

function playUnrecognizedSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.4);
}

// --- Recognition toggle ---
function toggleRecognition() {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1][0].transcript;
            document.getElementById('output').innerText = result;
            markNumberAsChecked(result);
        };

        recognition.onend = () => {
            if (isListening) recognition.start();
        };
    }

    if (!isListening) {
        recognition.lang = isEnglish ? 'en-US' : 'de-DE';
        recognition.start();
        isListening = true;
    } else {
        recognition.stop();
        isListening = false;
    }

    document.getElementById('start-recognition').innerText = isListening ? 'Stop Recognition' : 'Start Recognition';
}

// --- Language toggle ---
function toggleLanguage() {
    isEnglish = !isEnglish;
    document.getElementById('language-toggle').innerText =
        isEnglish ? 'Sprache auf Deutsch wechseln' : 'Change the language to English';

    if (isListening) {
        recognition.stop();
        recognition.lang = isEnglish ? 'en-US' : 'de-DE';
    }
}

document.getElementById('start-recognition').addEventListener('click', () => {
    toggleWakeLock();
    toggleRecognition();
});
document.getElementById('language-toggle').addEventListener('click', toggleLanguage);

// --- Mark number as checked ---
function markNumberAsChecked(text) {
    const normalizedText = normalizeTranscript(text);
    const numbers = normalizedText.match(/\d+/g);
    let matched = false;

    if (numbers) {
        for (const numberStr of numbers) {
            const number = parseInt(numberStr);
            if (!isNaN(number) && numbersList.includes(number)) {
                const checkbox = document.getElementById('check-' + number);
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                    playSuccessSound();
                    vibrate();
                    checkbox.closest('tr').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    updateProgress();
                    matched = true;
                }
            }

            if (number === 55) {
                const checkbox5 = document.getElementById('check-5');
                if (checkbox5 && !checkbox5.checked) {
                    checkbox5.checked = true;
                    playSuccessSound();
                    vibrate();
                    checkbox5.closest('tr').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    updateProgress();
                    matched = true;
                }
            }
        }
    }

    if (!matched) playUnrecognizedSound();
}

// --- Reset checkboxes ---
document.getElementById('reset-checkboxes').addEventListener('click', () => {
    for (const number of numbersList) {
        const checkbox = document.getElementById('check-' + number);
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            checkbox.removeAttribute('data-number-text');
        }
    }
    updateProgress();
});

// --- Build session data ---
function buildSessionData(comments = {}) {
    const now = new Date();
    const checked = [];
    const unchecked = [];

    for (const number of numbersList) {
        const cb = document.getElementById('check-' + number);
        if (cb && cb.checked) {
            checked.push(number);
        } else {
            unchecked.push({
                number,
                reason: comments[number] || 'Nicht ausgelöst'
            });
        }
    }

    return {
        exportedAt: now.toISOString(),
        exportedAtReadable: now.toLocaleString('de-DE'),
        complete: unchecked.length === 0,
        checked,
        unchecked
    };
}

// --- Export JSON ---
function doExportJSON(comments = {}) {
    const data = buildSessionData(comments);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `bewegungsmelder-test-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- Export PDF using jsPDF ---
function doExportPDF(comments = {}) {
    const data = buildSessionData(comments);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Offizielles Exportdokument', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Melder-Probe', 105, 28, { align: 'center' });
    doc.text(`Datum: ${data.exportedAtReadable}`, 105, 35, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Mit diesem Dokument haben wir die Funktionalität der Melder-Nummern getestet:', 20, 45);

    // Table header
    let yPos = 55;
    doc.setFont('helvetica', 'bold');
    doc.text('Melder Nr.', 25, yPos);
    doc.text('Status', 70, yPos);
    doc.text('Kommentar', 120, yPos);
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');

    // Checked items
    for (const number of data.checked) {
        if (yPos > 270) break; // A4 page limit
        doc.text(String(number), 25, yPos);
        doc.text('✓ Ausgelöst', 70, yPos);
        doc.text('—', 120, yPos);
        yPos += 7;
    }

    // Unchecked items
    for (const item of data.unchecked) {
        if (yPos > 270) break;
        doc.text(String(item.number), 25, yPos);
        doc.text('✗ Nicht ausgelöst', 70, yPos);
        
        // Word wrap for comments
        const comment = item.reason || 'Kein Kommentar';
        const maxWidth = 65;
        const lines = doc.splitTextToSize(comment, maxWidth);
        doc.text(lines, 120, yPos);
        yPos += Math.max(7, lines.length * 5);
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Erstellt am ${data.exportedAtReadable}`, 105, 285, { align: 'center' });

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`bewegungsmelder-test-${dateStr}.pdf`);
}

// --- Export format selection ---
document.getElementById('export-btn').addEventListener('click', () => {
    document.getElementById('export-format-modal').showModal();
});

document.getElementById('export-format-cancel').addEventListener('click', () => {
    document.getElementById('export-format-modal').close();
});

document.getElementById('export-json-btn').addEventListener('click', () => {
    document.getElementById('export-format-modal').close();
    const allChecked = numbersList.every(n => {
        const cb = document.getElementById('check-' + n);
        return cb && cb.checked;
    });
    
    if (allChecked) {
        doExportJSON();
    } else {
        pendingExportType = 'json';
        openCommentModal();
    }
});

document.getElementById('export-pdf-btn').addEventListener('click', () => {
    document.getElementById('export-format-modal').close();
    const allChecked = numbersList.every(n => {
        const cb = document.getElementById('check-' + n);
        return cb && cb.checked;
    });
    
    if (allChecked) {
        doExportPDF();
    } else {
        pendingExportType = 'pdf';
        openCommentModal();
    }
});

// --- Comment modal logic ---
function openCommentModal() {
    const unchecked = numbersList.filter(n => {
        const cb = document.getElementById('check-' + n);
        return !(cb && cb.checked);
    });

    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = unchecked.map(n => `
        <div class="comment-row">
            <label for="comment-${n}">Nr. ${n}</label>
            <input type="text" id="comment-${n}" placeholder="Grund..." />
        </div>
    `).join('');

    document.getElementById('comment-modal').showModal();
}

function getComments() {
    const comments = {};
    const unchecked = numbersList.filter(n => {
        const cb = document.getElementById('check-' + n);
        return !(cb && cb.checked);
    });
    for (const n of unchecked) {
        const input = document.getElementById('comment-' + n);
        if (input) comments[n] = input.value.trim() || 'Kein Grund angegeben';
    }
    return comments;
}

document.getElementById('comment-confirm').addEventListener('click', () => {
    const comments = getComments();
    document.getElementById('comment-modal').close();
    
    if (pendingExportType === 'json') {
        doExportJSON(comments);
    } else if (pendingExportType === 'pdf') {
        doExportPDF(comments);
    }
    
    pendingExportType = null;
});

document.getElementById('comment-cancel').addEventListener('click', () => {
    document.getElementById('comment-modal').close();
    pendingExportType = null;
});

// --- Import JSON ---
document.getElementById('import-json').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            for (const number of numbersList) {
                const cb = document.getElementById('check-' + number);
                if (cb) {
                    cb.checked = false;
                    cb.removeAttribute('data-number-text');
                }
            }

            if (data.checked && Array.isArray(data.checked)) {
                for (const number of data.checked) {
                    const cb = document.getElementById('check-' + number);
                    if (cb) cb.checked = true;
                }
            }

            updateProgress();
            alert(`Importierte Sitzung vom ${data.exportedAtReadable || 'unbekanntes Datum'}`);
        } catch {
            alert('Ungültige JSON-Datei.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
});

// --- Wake Lock ---
let wakeLock = null;
let isWakeLockEnabled = false;

if ('wakeLock' in navigator) {
    document.getElementById("wakeLockAPIAvailable").innerText = 'Wake Lock wird unterstützt';
} else {
    document.getElementById("wakeLockAPIAvailable").innerText = 'Wake Lock wird nicht unterstützt';
}

async function toggleWakeLock() {
    if (isWakeLockEnabled) {
        if (wakeLock) {
            wakeLock.release().then(() => {
                wakeLock = null;
            });
        }
        isWakeLockEnabled = false;
    } else {
        if (!wakeLock) {
            wakeLock = await navigator.wakeLock.request("screen");
            console.log("Wake Lock is acquired");
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock is released');
            });
        }
        isWakeLockEnabled = true;
    }
}

// --- Debug toggle ---
document.querySelector('h1').addEventListener('click', () => {
    const consoleLog = document.getElementById('console-log');
    const output = document.getElementById('output');
    if (consoleLog && output) {
        consoleLog.classList.toggle('hidden');
        output.classList.toggle('hidden');
    }
});

// --- Init ---
updateProgress();
