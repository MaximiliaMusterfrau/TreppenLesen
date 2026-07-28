// ==============================
// TreppenLesen
// app.js
// ==============================

const startScreen = document.getElementById("startScreen");
const learnScreen = document.getElementById("learnScreen");

const startButton = document.getElementById("startButton");
const homeButton = document.getElementById("homeButton");

const listSelect = document.getElementById("listSelect");
const currentList = document.getElementById("currentList");

const stairs = document.getElementById("stairs");

const listenButton = document.getElementById("listenButton");
const micButton = document.getElementById("micButton");

const feedback = document.getElementById("feedback");
const stars = document.getElementById("stars");

let currentWords = [];
let currentWord = null;
let lastWord = null;

let starCount = 0;

let recognition = null;


// ==============================
// Bildschirme
// ==============================

function showScreen(screen){

    startScreen.classList.remove("active");
    learnScreen.classList.remove("active");

    screen.classList.add("active");

}


// ==============================
// Sterne
// ==============================

function updateStars(){

    stars.textContent = `${starCount} ⭐`;

}


// ==============================
// Wörter laden
// ==============================

function loadWords(){

    const selected = listSelect.value;

    if(selected === "alle"){

        currentWords = [...words];
        currentList.textContent = "Alle Lernwörter";

    }else{

        currentWords = words.filter(
            w => w.list === selected
        );

        currentList.textContent = selected;

    }

}


// ==============================
// Zufallswort
// ==============================

function chooseWord(){

    loadWords();

    if(currentWords.length === 0){

        currentWord = null;
        return;

    }

    let selected =
        currentWords[
            Math.floor(Math.random()*currentWords.length)
        ];

    while(
        currentWords.length > 1 &&
        lastWord &&
        selected.word === lastWord.word
    ){

        selected =
            currentWords[
                Math.floor(Math.random()*currentWords.length)
            ];

    }

    currentWord = selected;
    lastWord = selected;

}


// ==============================
// Treppe anzeigen
// ==============================

function showWord(){

    chooseWord();

    if(currentWord === null){

        stairs.innerHTML = "";
        feedback.textContent = "Keine Wörter vorhanden.";
        return;

    }

    feedback.textContent = "";

    let html = "";

    for(let i=1;i<=currentWord.word.length;i++){

        html += currentWord.word.substring(0,i) + "<br>";

    }

    stairs.innerHTML = html;

}


// ==============================
// Vorlesen
// ==============================

let germanVoice = null;

function loadVoices() {

    const voices = speechSynthesis.getVoices();

    // 1. Bevorzugt Markus
    germanVoice =
        voices.find(v =>
            v.name.toLowerCase().includes("markus")
        ) ||

        // 2. Danach andere deutsche Stimmen
        voices.find(v =>
            v.lang === "de-DE"
        ) ||

        voices.find(v =>
            v.lang.startsWith("de")
        ) ||

        // 3. Falls nichts gefunden wurde
        null;

    console.log("Verwendete Stimme:", germanVoice);

}

loadVoices();

speechSynthesis.onvoiceschanged = loadVoices;

listenButton.addEventListener("click",()=>{

    if(currentWord===null) return;

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(currentWord.word);

    speech.lang = "de-DE";
    speech.rate = 0.9;
    speech.pitch = 1;

    if(germanVoice){

        speech.voice = germanVoice;

    }

    speechSynthesis.speak(speech);

});
// ==============================
// Spracherkennung
// ==============================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "de-DE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {

        feedback.textContent = "🎤 Ich höre zu ...";

    };

    recognition.onresult = (event) => {

        const spoken =
            event.results[0][0].transcript
                .trim()
                .toLowerCase();

        const target =
            currentWord.word
                .trim()
                .toLowerCase();

        if (spoken === target) {

            starCount++;
            updateStars();

            feedback.textContent = "⭐ Super gemacht!";

            setTimeout(() => {

                showWord();

            }, 1200);

        } else {

            feedback.textContent =
                `😊 Du hast "${spoken}" gesagt. Versuche es noch einmal.`;

        }

    };

    recognition.onerror = () => {

        feedback.textContent =
            "⚠️ Spracherkennung konnte nicht gestartet werden.";

    };

} else {

    micButton.disabled = true;

    feedback.textContent =
        "⚠️ Dieser Browser unterstützt keine Spracherkennung.";

}

micButton.addEventListener("click", () => {

    if (recognition && currentWord) {

        recognition.start();

    }

});


// ==============================
// Buttons
// ==============================

startButton.addEventListener("click", () => {

    showScreen(learnScreen);
    showWord();

});

homeButton.addEventListener("click", () => {

    speechSynthesis.cancel();

    if (recognition) {

        recognition.abort();

    }

    feedback.textContent = "";

    showScreen(startScreen);

});


// ==============================
// Service Worker
// ==============================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js");

    });

}


// ==============================
// Start
// ==============================

updateStars();

showScreen(startScreen);
