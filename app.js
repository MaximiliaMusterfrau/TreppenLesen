const startScreen = document.getElementById("startScreen");
const learnScreen = document.getElementById("learnScreen");

const startButton = document.getElementById("startButton");
const homeButton = document.getElementById("homeButton");

const listSelect = document.getElementById("listSelect");
const currentList = document.getElementById("currentList");

const stairs = document.getElementById("stairs");
const speakButton = document.getElementById("speakButton");
const nextButton = document.getElementById("nextButton");


let currentWords = [];
let currentWord = null;
let lastWord = null;

let startTime = 0;


// ------------------------------
// Lernstand speichern
// ------------------------------

let learningData = JSON.parse(
    localStorage.getItem("treppenlesen-data")
) || {};



function getWordData(word) {


    if (!learningData[word]) {


        learningData[word] = {

            level: 1,

            attempts: 0,

            averageTime: 0,

            nextReview: 0

        };


    }


    return learningData[word];

}



function saveData(){


    localStorage.setItem(

        "treppenlesen-data",

        JSON.stringify(learningData)

    );


}



// ------------------------------
// Navigation
// ------------------------------

function showScreen(screen){


    startScreen.classList.remove("active");

    learnScreen.classList.remove("active");


    screen.classList.add("active");


}



// ------------------------------
// Wörter laden
// ------------------------------

function loadWords(){


    const selected = listSelect.value;


    if(selected === "alle"){


        currentWords = [...words];


        currentList.textContent =
            "Alle Lernwörter";


    }
    else{


        currentWords = words.filter(word =>

            word.list === selected

        );


        currentList.textContent = selected;


    }


}



// ------------------------------
// Schwierigkeit berechnen
// ------------------------------

function calculatePriority(word){


    const data = getWordData(word.word);


    const now = Date.now();



    // Neue Wörter zuerst

    if(data.attempts === 0){

        return 1000000;

    }



    // Wörter, deren Wiederholung fällig ist

    if(data.nextReview <= now){

        return 500000;

    }



    // langsam gelesene Wörter

    const letters =
        word.word.replace(/ /g,"").length;


    const speed =
        data.averageTime / letters;



    let priority = speed;



    // niedrigere Lernstufe = wichtiger

    priority +=
        (6 - data.level) * 100;



    return priority;


}



// ------------------------------
// Wort auswählen
// ------------------------------

function chooseWord(){


    loadWords();


    currentWords.sort((a,b)=>{


        return (

            calculatePriority(b) -

            calculatePriority(a)

        );


    });



    let selected = currentWords[0];



    if(

        lastWord &&

        selected.word === lastWord.word &&

        currentWords.length > 1

    ){


        selected = currentWords[1];


    }



    currentWord = selected;

    lastWord = selected;


}



// ------------------------------
// Treppenwort anzeigen
// ------------------------------

function showWord(){


    chooseWord();


    startTime = Date.now();


    nextButton.disabled = true;


    let html = "";


    for(

        let i = 1;

        i <= currentWord.word.length;

        i++

    ){


        let step =
            currentWord.word.substring(0,i);



        if(step.trim() !== ""){


            html += step + "<br>";


        }


    }



    stairs.innerHTML = html;


}



// ------------------------------
// Vorlesen + Auswertung
// ------------------------------

speakButton.addEventListener(
"click",
()=>{


    const readingTime =
        Date.now() - startTime;



    const data =
        getWordData(currentWord.word);



    data.attempts++;



    if(data.averageTime === 0){


        data.averageTime = readingTime;


    }
    else{


        data.averageTime = Math.round(

            (data.averageTime + readingTime) / 2

        );


    }



    const letters =
        currentWord.word.replace(/ /g,"").length;



    const speed =
        readingTime / letters;



    // Lernstufe verändern

    if(speed < 500){


        data.level++;


    }
    else if(speed > 1500){


        data.level--;


    }



    if(data.level < 1){

        data.level = 1;

    }


    if(data.level > 5){

        data.level = 5;

    }



    // Wiederholungsabstand

    let days;



    if(data.level === 1){

        days = 0;

    }
    else if(data.level === 2){

        days = 1;

    }
    else if(data.level === 3){

        days = 3;

    }
    else if(data.level === 4){

        days = 7;

    }
    else{

        days = 14;

    }



    data.nextReview =
        Date.now() +
        days * 24 * 60 * 60 * 1000;



    saveData();



    const speech =
        new SpeechSynthesisUtterance(
            currentWord.word
        );



    speech.lang = "de-DE";

    speech.rate = 0.8;



    speech.onend = ()=>{


        nextButton.disabled = false;


    };



    speechSynthesis.cancel();

    speechSynthesis.speak(speech);



});



// ------------------------------
// Weiter
// ------------------------------

nextButton.addEventListener(
"click",
()=>{


    showWord();


});



// ------------------------------
// Start
// ------------------------------

startButton.addEventListener(
"click",
()=>{


    showScreen(learnScreen);

    showWord();


});



homeButton.addEventListener(
"click",
()=>{


    showScreen(startScreen);


});



// Offline

if("serviceWorker" in navigator){


    window.addEventListener(
    "load",
    ()=>{


        navigator.serviceWorker.register(
            "service-worker.js"
        );


    });


}



showScreen(startScreen);