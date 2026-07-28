// ==============================
// TreppenLesen
// app.js
// Teil 1 von 4
// ==============================


// ==============================
// Elemente
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


// ==============================
// Variablen
// ==============================

let currentWords = [];
let currentWord = null;
let lastWord = null;

let currentParts = [];
let currentStep = 0;

let recognition = null;
let germanVoice = null;

let starCount = 0;
let failedAttempts = 0;


// ==============================
// Lautgruppen
// ==============================

const soundGroups = [

    "tsch",
    "sch",

    "ch",
    "sp",
    "st",

    "ei",
    "ie",
    "au",
    "eu",

    "tz",
    "ck",

    "ng",
    "qu",
    "pf"

];

const easyGroups = [

    "ei",
    "ie",
    "au",
    "eu"

];

const hardGroups = [

    "sch",
    "ch",
    "sp",
    "st",
    "tz",
    "ck",
    "ng",
    "qu",
    "pf"

];


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
// Schwierigkeit berechnen
// ==============================

function getDifficulty(word){

    const lower = word.toLowerCase();

    let score = word.length;

    easyGroups.forEach(group=>{

        if(lower.includes(group)){

            score += 5;

        }

    });

    hardGroups.forEach(group=>{

        if(lower.includes(group)){

            score += 10;

        }

    });

    return score;

}


// ==============================
// Wörter laden
// ==============================

function loadWords(){

    const selected = listSelect.value;

    if(selected === "alle"){

        currentWords = [...words];

        currentWords.sort((a,b)=>{

            return getDifficulty(a.word) -
                   getDifficulty(b.word);

        });

        currentList.textContent =
            "Alle Lernwörter";

    }else{

        currentWords = words.filter(
            w => w.list === selected
        );

        currentList.textContent =
            selected;

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

    if(listSelect.value === "alle"){

        currentWord = currentWords.shift();

        currentWords.push(currentWord);

    }else{

        let selected =
            currentWords[
                Math.floor(
                    Math.random() *
                    currentWords.length
                )
            ];

        while(

            currentWords.length > 1 &&
            lastWord &&
            selected.word === lastWord.word

        ){

            selected =
                currentWords[
                    Math.floor(
                        Math.random() *
                        currentWords.length
                    )
                ];

        }

        currentWord = selected;

    }

    lastWord = currentWord;

    currentParts =
        splitWord(currentWord.word);

    currentStep = 1;

    failedAttempts = 0;

}


// ==============================
// Wort zerlegen
// ==============================

function splitWord(word){

    const parts = [];

    let i = 0;

    while(i < word.length){

        let found = false;

        for(const group of soundGroups){

            const text =
                word.substring(
                    i,
                    i + group.length
                ).toLowerCase();

            if(text === group){

                parts.push(
                    word.substring(
                        i,
                        i + group.length
                    )
                );

                i += group.length;

                found = true;

                break;

            }

        }

        if(!found){

            parts.push(word[i]);

            i++;

        }

    }

    return parts;

}


// ==============================
// Treppe anzeigen
// ==============================

function showCurrentStep(){

    let html = "";

    let text = "";

    for(

        let i = 0;

        i < currentStep;

        i++

    ){

        text += currentParts[i];

        html +=

            `<div class="step">

                ${text}

            </div>`;

    }

    stairs.innerHTML = html;

}


// ==============================
// Neues Wort
// ==============================

function showWord(){

    chooseWord();

    if(currentWord === null){

        stairs.innerHTML = "";

        feedback.textContent =
            "Keine Wörter vorhanden.";

        return;

    }

    feedback.textContent = "";

    showCurrentStep();

    setTimeout(()=>{

        startRecognition();

    },500);

}
// ==============================
// Stimmen
// ==============================

function loadVoices(){

    const voices =
        speechSynthesis.getVoices();

    germanVoice =

        voices.find(v =>
            v.name.toLowerCase().includes("markus")
        ) ||

        voices.find(v =>
            v.lang === "de-DE"
        ) ||

        voices.find(v =>
            v.lang.startsWith("de")
        ) ||

        null;

}

loadVoices();

speechSynthesis.onvoiceschanged =
    loadVoices;


// ==============================
// Aktuelle Zeile vorlesen
// ==============================

function speakCurrentStep(){

    speechSynthesis.cancel();

    let text = "";

    for(

        let i = 0;

        i < currentStep;

        i++

    ){

        text += currentParts[i];

    }

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "de-DE";
    speech.rate = 0.9;
    speech.pitch = 1;

    if(germanVoice){

        speech.voice = germanVoice;

    }

    speech.onend = ()=>{

        setTimeout(()=>{

            startRecognition();

        },500);

    };

    speechSynthesis.speak(speech);

}


// ==============================
// Spracherkennung
// ==============================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if(SpeechRecognition){

    recognition =
        new SpeechRecognition();

    recognition.lang = "de-DE";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onstart = ()=>{

        feedback.textContent =
            "🎤 Bitte lesen...";

    };

    recognition.onresult = (event)=>{

        const spoken =
            event.results[0][0].transcript
            .trim()
            .toLowerCase();

        let target = "";

        for(

            let i = 0;

            i < currentStep;

            i++

        ){

            target += currentParts[i];

        }

        target =
            target.toLowerCase();

        if(spoken === target){

            failedAttempts = 0;

            if(currentStep < currentParts.length){

                currentStep++;

                showCurrentStep();

                setTimeout(()=>{

                    startRecognition();

                },500);

            }else{

                starCount++;

                updateStars();

                feedback.textContent =
                    "⭐ Super gemacht!";

                setTimeout(()=>{

                    showWord();

                },1200);

            }

        }else{

            failedAttempts++;

            feedback.textContent =
                "😊 Versuche es noch einmal.";

            if(failedAttempts >= 1){

                listenButton.style.display =
                    "inline-block";

            }

        }

    };
        recognition.onerror = ()=>{

        feedback.textContent =
            "⚠️ Bitte erneut versuchen.";

    };

}else{

    micButton.disabled = true;

    feedback.textContent =
        "⚠️ Spracherkennung wird auf diesem Gerät nicht unterstützt.";

}


// ==============================
// Spracherkennung starten
// ==============================

function startRecognition(){

    if(!recognition) return;

    recognition.start();

}


// ==============================
// Hilfe-Button
// ==============================

listenButton.style.display = "none";

listenButton.addEventListener("click",()=>{

    listenButton.style.display = "none";

    speakCurrentStep();

});


// ==============================
// Buttons
// ==============================

startButton.addEventListener("click",()=>{

    showScreen(learnScreen);

    showWord();

});


homeButton.addEventListener("click",()=>{

    speechSynthesis.cancel();

    if(recognition){

        recognition.abort();

    }

    listenButton.style.display = "none";

    feedback.textContent = "";

    showScreen(startScreen);

});


// ==============================
// Service Worker
// ==============================

if("serviceWorker" in navigator){

    window.addEventListener("load",()=>{

        navigator.serviceWorker.register(
            "service-worker.js"
        );

    });

}


// ==============================
// Start
// ==============================

updateStars();

showScreen(startScreen);
