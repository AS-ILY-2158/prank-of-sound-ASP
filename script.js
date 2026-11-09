let userName = "";
let userAge = 18;
let speechInterval = null;
let sirenInterval = null;
let isLocked = true;
let audioCtx = null;
let currentQIndex = 0;

// بینک الارم یا فائر بریگیڈ کی طرح تیز اور چبنے والا سائرن (High-Pitch Siren Sound)
function playBankAlarm() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        // فریکوینسی کو اوپر نیچے کر کے سائرن کی آواز بنانا
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.25);
        osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch(e) {}
}

// نام لے کر بولنے والا فنکشن
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

// نرسری سے کلاس 10 تک کے بیسک ریاضی کے سوالات (پلس، مائنس، ضرب، تقسیم)
const mathQuestions = [
    { q: "What is 15 + 12 ?", options: ["25", "27", "30"], correct: 1 },
    { q: "What is 50 - 18 ?", options: ["32", "35", "28"], correct: 0 },
    { q: "What is 8 multiplied by 7 ?", options: ["54", "56", "64"], correct: 1 },
    { q: "What is 81 divided by 9 ?", options: ["7", "8", "9"], correct: 2 },
    { q: "What is 24 + 36 ?", options: ["60", "58", "62"], correct: 0 },
    { q: "What is 100 - 45 ?", options: ["55", "65", "50"], correct: 0 },
    { q: "What is 12 multiplied by 4 ?", options: ["42", "48", "52"], correct: 1 },
    { q: "What is 45 divided by 5 ?", options: ["8", "9", "10"], correct: 1 }
];

function initiatePrank() {
    const nameInput = document.getElementById('userName').value.trim();
    const ageInput = parseInt(document.getElementById('userAge').value);

    if(nameInput === "" || isNaN(ageInput)) {
        alert("Please fill in your name and age correctly!");
        return;
    }

    userName = nameInput;
    userAge = ageInput;

    // فل سکرین ان ایبل کریں
    try { document.documentElement.requestFullscreen(); } catch(e) {}

    document.getElementById('stepForm').classList.add('hidden');
    document.getElementById('stepQuiz').classList.remove('hidden');

    loadQuestion();
}

function loadQuestion() {
    isLocked = true;
    document.getElementById('errorMsg').innerText = "";
    document.body.className = ""; // فل سکرین فلیش ہٹائیں

    const currentQ = mathQuestions[currentQIndex % mathQuestions.length];
    document.getElementById('questionText').innerText = currentQ.q;

    const optContainer = document.getElementById('optionsContainer');
    optContainer.innerHTML = "";

    currentQ.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = "option-btn";
        btn.innerText = `${String.fromCharCode(65 + index)}. ${optText}`;
        btn.onclick = () => checkSelectedOption(index, currentQ.correct);
        optContainer.appendChild(btn);
    });

    // پہلی بار نام لے کر بولنا
    speakText(`${userName}, solve this question right now!`);

    // ہر 5 سیکنڈ بعد نام دہرانے کا لوپ اور سائرن
    if(speechInterval) clearInterval(speechInterval);
    if(sirenInterval) clearInterval(sirenInterval);

    speechInterval = setInterval(() => {
        if(isLocked) {
            speakText(`${userName}! Solve the question!`);
        }
    }, 5000);

    sirenInterval = setInterval(() => {
        if(isLocked) {
            playBankAlarm();
        }
    }, 700);
}

function checkSelectedOption(selectedIndex, correctIndex) {
    if(selectedIndex === correctIndex) {
        // صحیح جواب! (گرین فلیش)
        isLocked = false;
        clearInterval(speechInterval);
        clearInterval(sirenInterval);
        window.speechSynthesis.cancel();

        document.body.className = "green-flash";

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => {});
        }

        document.getElementById('stepQuiz').classList.add('hidden');
        document.getElementById('stepCountdown').classList.remove('hidden');

        startCountdownTimer();

    } else {
        // غلط جواب! (ریڈ فلیش وارننگ)
        document.body.className = "red-flash";
        playBankAlarm();
        document.getElementById('errorMsg').innerText = "Incorrect Option! Security lock active.";
        speakText(`Wrong choice ${userName}! Try again!`);
        
        setTimeout(() => {
            if(isLocked) document.body.className = "";
        }, 800);
    }
}

function startCountdownTimer() {
    let timeLeft = 20;
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.innerText = timeLeft;

    let timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            currentQIndex++;
            document.getElementById('stepCountdown').classList.add('hidden');
            document.getElementById('stepQuiz').classList.remove('hidden');
            
            try { document.documentElement.requestFullscreen(); } catch(e) {}
            loadQuestion();
        }
    }, 1000);
}

// ویب سائٹ بند کرنے یا ٹیب کاٹنے سے روکنے کا سکیورٹی پھندا
window.addEventListener('beforeunload', function (e) {
    if(isLocked) {
        e.preventDefault();
        e.returnValue = '';
    }
});
