const riddles = [
    // Niveles 1 al 4 (Fáciles)
    {
        q: "¿Qué cosa es que cuanto más le quitas, más grande se hace?",
        options: ["A) Un pozo", "B) Una montaña", "C) Un pastel"],
        correct: 0,
        difficulty: "easy"
    },
    {
        q: "Tiene cuatro dedos y un pulgar, pero no tiene carne ni huesos. ¿Qué es?",
        options: ["A) Una mesa", "B) Un guante", "C) Una estatua"],
        correct: 1,
        difficulty: "easy"
    },
    {
        q: "Blanco es, la gallina lo pone, con aceite se fríe y se come. ¿Qué es?",
        options: ["A) El pan", "B) El arroz", "C) El huevo"],
        correct: 2,
        difficulty: "easy"
    },
    {
        q: "¿Qué pasa por el agua y nunca se moja?",
        options: ["A) Un pez", "B) La sombra", "C) Una piedra"],
        correct: 1,
        difficulty: "easy"
    },
    // Niveles 5 en adelante (Más difíciles)
    {
        q: "Si me nombras, desaparezco. ¿Quién soy?",
        options: ["A) El eco", "B) El silencio", "C) El viento"],
        correct: 1,
        difficulty: "hard"
    },
    {
        q: "Vuela sin alas, chilla sin voz, no tiene boca y te ataca veloz. ¿Qué soy?",
        options: ["A) El rayo", "B) El viento", "C) La noche"],
        correct: 1,
        difficulty: "hard"
    },
    {
        q: "Tengo agujas pero no sé coser, tengo números pero no sé leer. ¿Quién soy?",
        options: ["A) Un libro", "B) El reloj", "C) Una computadora"],
        correct: 1,
        difficulty: "hard"
    },
    {
        q: "¿Qué es lo que se puede romper tan solo con nombrarlo?",
        options: ["A) El cristal", "B) El silencio", "C) Una promesa"],
        correct: 1,
        difficulty: "hard"
    },
    {
        q: "Tiene cabeza de hierro y cuerpo de madera, golpea duro y la puerta afloja. ¿Qué es?",
        options: ["A) Un martillo", "B) Un clavo", "C) Una sierra"],
        correct: 0,
        difficulty: "hard"
    }
];

let currentLevel = 1;
let timeLeft = 30;
let timerInterval = null;
let currentRiddle = null;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    try {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        let now = audioCtx.currentTime;

        if (type === 'tick') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(700, now);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(660, now + 0.1);
            osc.frequency.setValueAtTime(880, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(25, now + 0.5);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch(e) {}
}

function startGame() {
    currentLevel = 1;
    loadLevel();
}

function loadLevel() {
    clearInterval(timerInterval);
    // 30 segundos para niveles 1-4, 20 segundos para niveles superiores más difíciles
    timeLeft = currentLevel <= 4 ? 30 : 20;
    
    let difficultyText = currentLevel <= 4 ? "FÁCIL" : "DIFÍCIL";
    document.getElementById("level-display").innerText = `NIVEL: ${currentLevel} (${difficultyText})`;
    
    let availableRiddles = currentLevel <= 4 
        ? riddles.filter(r => r.difficulty === "easy") 
        : riddles.filter(r => r.difficulty === "hard");
    
    if (availableRiddles.length === 0) availableRiddles = riddles;
    currentRiddle = availableRiddles[Math.floor(Math.random() * availableRiddles.length)];

    document.getElementById("riddle-question").innerText = currentRiddle.q;
    document.getElementById("btn-a").innerText = currentRiddle.options[0];
    document.getElementById("btn-b").innerText = currentRiddle.options[1];
    document.getElementById("btn-c").innerText = currentRiddle.options[2];

    setButtonsEnabled(true);
    startTimer();
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        playSound('tick');

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            triggerExplosion("¡TIEMPO AGOTADO! La bomba ha detonado.");
        }
    }, 1000);
}

function updateTimerDisplay() {
    let secs = timeLeft < 10 ? "0" + timeLeft : timeLeft;
    document.getElementById("timer-display").innerText = `00:${secs}`;
}

function checkAnswer(selectedIndex) {
    initAudio();
    clearInterval(timerInterval);

    if (selectedIndex === currentRiddle.correct) {
        playSound('success');
        currentLevel++;
        setButtonsEnabled(false);
        document.getElementById("riddle-question").innerText = "¡DESACTIVADA! Pasando al siguiente nivel...";
        setTimeout(() => {
            loadLevel();
        }, 1200);
    } else {
        triggerExplosion("¡RESPUESTA INCORRECTA! La bomba ha estallado.");
    }
}

function triggerExplosion(message) {
    playSound('explosion');
    document.body.style.backgroundColor = "#900c3f";
    document.getElementById("riddle-question").innerText = message;
    document.getElementById("timer-display").innerText = "00:00";
    setButtonsEnabled(false);

    setTimeout(() => {
        document.body.style.backgroundColor = "#0d1117";
        startGame();
    }, 3000);
}

function setButtonsEnabled(enabled) {
    document.getElementById("btn-a").disabled = !enabled;
    document.getElementById("btn-b").disabled = !enabled;
    document.getElementById("btn-c").disabled = !enabled;
}

startGame();
