lucide.createIcons();

const iconThemes = {
    lucide: ['heart', 'star', 'circle', 'square', 'triangle', 'diamond', 'crown', 'sun', 'moon', 'cloud', 'zap', 'flag', 'bell', 'bookmark', 'coffee'],
    emoji: ['😀', '😍', '🤔', '😎', '🥳', '😱', '🤯', '🥶', '🤩', '🤗', '🚀', '🌈', '🍕', '🎉', '🦄']
};

let gameState = {
    3: { currentAttempt: 0, currentPosition: 0 },
    4: { currentAttempt: 0, currentPosition: 0 },
    5: { currentAttempt: 0, currentPosition: 0 }
};
let currentTheme = 'lucide';
let secretCombination = [];
let gameBoards = {
    3: { board: [], completed: false, message: '', correctCombination: [] },
    4: { board: [], completed: false, message: '', correctCombination: [] },
    5: { board: [], completed: false, message: '', correctCombination: [] }
};
let usedIcons = {
    3: {},
    4: {},
    5: {}
};
let difficulty = 3;
const maxAttempts = 5;
const gameBoardElement = document.getElementById('gameBoard');
const iconSelectorElement = document.getElementById('iconSelector');
const undoButton = document.getElementById('undoButton');
const confirmButton = document.getElementById('confirmButton');
const messageElement = document.getElementById('message');
const remainingAttemptsElement = document.getElementById('remainingAttempts');
// Removed: const darkModeToggle = document.getElementById('darkModeToggle');
const iconThemeSelect = document.getElementById('iconTheme');
const difficultySelect = document.getElementById('difficulty');

function getDateSeed() {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

let currentDate = new Date().toISOString().split('T')[0];
let selectedDate = currentDate;

// Función para generar una combinación secreta basada en una fecha
function generateSecretCombinationForDate(date, diff) {
    const seed = new Date(date).getTime();
    const secretComb = [];
    const availableIcons = diff * 3;
    for (let i = 0; i < diff; i++) {
        const randomIndex = Math.floor(seededRandom(seed + i) * availableIcons);
        secretComb.push(randomIndex);
    }
    return secretComb;
}

function generateSecretCombination() {
    const seed = getDateSeed();
    secretCombination = [];
    const availableIcons = difficulty * 3;
    for (let i = 0; i < difficulty; i++) {
        const randomIndex = Math.floor(seededRandom(seed + i) * availableIcons);
        secretCombination.push(randomIndex);
    }
    gameBoards[difficulty].correctCombination = [...secretCombination];
}

function initializeGame(selectToday) {
    if(selectToday) {
        currentDate = new Date().toISOString().split('T')[0];
        selectedDate = currentDate;
    }

    const gameStateKey = `gameState_${selectedDate}`;
    const savedState = localStorage.getItem(gameStateKey);
    
    if (savedState) {
        loadGameState(JSON.parse(savedState));
    } else {
        gameBoards[difficulty] = {
            board: Array(maxAttempts).fill().map(() => Array(difficulty).fill(null)),
            completed: false,
            message: '',
            correctCombination: generateSecretCombinationForDate(selectedDate, difficulty)
        };
        gameState[difficulty] = { currentAttempt: 0, currentPosition: 0 };
        usedIcons[difficulty] = {};
        saveGameState();
    }
}

function updateUI() {
    // Limpiar el tablero de juego y el selector de iconos
    gameBoardElement.innerHTML = '';
    iconSelectorElement.innerHTML = '';

    // Configurar la cuadrícula del tablero de juego
    gameBoardElement.style.gridTemplateColumns = `repeat(${difficulty}, auto)`;

    const currentBoard = gameBoards[difficulty];
    // Iterar sobre los intentos
    for (let i = 0; i < maxAttempts; i++) {
        // Inicializar fila si no existe
        if (!currentBoard.board[i]) {
            currentBoard.board[i] = Array(difficulty).fill(null);
        }
        // Iterar sobre las columnas
        for (let j = 0; j < difficulty; j++) {
            const slot = document.createElement('div');
            slot.className = 'icon-slot';
            // Marcar el slot activo
            if (i === gameState[difficulty].currentAttempt && j === gameState[difficulty].currentPosition) {
                slot.classList.add('active');
            }
            // Renderizar icono si existe
            if (currentBoard.board[i][j] !== null) {
                slot.innerHTML = renderIcon(currentBoard.board[i][j].icon);
                if (currentBoard.board[i][j].result) {
                    slot.classList.add(currentBoard.board[i][j].result);
                }
            }
            gameBoardElement.appendChild(slot);
        }
    }

    // Configurar el selector de iconos
    const availableIcons = difficulty * 3;
    iconSelectorElement.style.gridTemplateColumns = `repeat(${Math.ceil(availableIcons / 3)}, 1fr)`;

    const icons = iconThemes[currentTheme].slice(0, availableIcons);
    icons.forEach((icon, index) => {
        const iconOption = document.createElement('div');
        iconOption.className = 'icon-option';
        iconOption.innerHTML = renderIcon(index);
        iconOption.onclick = () => selectIcon(index);
        // Marcar iconos según su estado
        if (usedIcons[difficulty] && usedIcons[difficulty][index]) {
            if (usedIcons[difficulty][index] === 'all') {
                iconOption.classList.add('all-found');
            } else if (usedIcons[difficulty][index] === 'some') {
                iconOption.classList.add('some-found');
            } else {
                iconOption.classList.add('not-found');
            }
        }
        iconSelectorElement.appendChild(iconOption);
    });

    // Inicializar iconos si se usa el tema 'lucide'
    if (currentTheme === 'lucide') {
        lucide.createIcons();
    }

    // Actualizar información de intentos restantes y estado de botones
    remainingAttemptsElement.textContent = `Intentos restantes: ${maxAttempts - gameState[difficulty].currentAttempt}`;

    undoButton.disabled = gameState[difficulty].currentPosition === 0 || currentBoard.completed;
    confirmButton.disabled = gameState[difficulty].currentPosition !== difficulty || currentBoard.completed;

    messageElement.innerHTML = currentBoard.message;
    if (currentBoard.completed && currentBoard.message.includes('Se acabaron los intentos')) {
        messageElement.innerHTML += ` La combinación correcta era: ${currentBoard.correctCombination.map(index => renderIcon(index)).join(' ')}`;
    }
}

function renderIcon(iconIndex) {
    const icon = iconThemes[currentTheme][iconIndex];
    return currentTheme === 'lucide' ? `<i data-lucide="${icon}"></i>` : icon;
}

function selectIcon(iconIndex) {
    if (gameState[difficulty].currentPosition < difficulty && !gameBoards[difficulty].completed) {
        gameBoards[difficulty].board[gameState[difficulty].currentAttempt][gameState[difficulty].currentPosition] = { icon: iconIndex, result: null };
        gameState[difficulty].currentPosition++;
        updateUI();
        saveGameState();
    }
}

function undoLastSelection() {
    if (gameState[difficulty].currentPosition > 0 && !gameBoards[difficulty].completed) {
        gameState[difficulty].currentPosition--;
        gameBoards[difficulty].board[gameState[difficulty].currentAttempt][gameState[difficulty].currentPosition] = null;
        updateUI();
        saveGameState();
    }
}

function checkCombination(onlyUpdate = false) {
    let correctPositions = 0;
    const currentBoard = gameBoards[difficulty];
    const currentCombination = currentBoard.board[gameState[difficulty].currentAttempt].map(slot => slot.icon);
    const secretCopy = [...currentBoard.correctCombination];
    const currentCopy = [...currentCombination];

    // Primero, verifica las posiciones correctas
    for (let i = 0; i < difficulty; i++) {
        if (currentCopy[i] === secretCopy[i]) {
            currentBoard.board[gameState[difficulty].currentAttempt][i].result = 'correct-position';
            correctPositions++;
            currentCopy[i] = secretCopy[i] = null;
        }
    }

    // Luego, verifica los iconos correctos en posición incorrecta
    for (let i = 0; i < difficulty; i++) {
        if (currentCopy[i] !== null) {
            const secretIndex = secretCopy.indexOf(currentCopy[i]);
            if (secretIndex !== -1) {
                currentBoard.board[gameState[difficulty].currentAttempt][i].result = 'correct-icon';
                secretCopy[secretIndex] = null;
            } else {
                currentBoard.board[gameState[difficulty].currentAttempt][i].result = null;
            }
        }
    }

    if (!onlyUpdate) {
        gameState[difficulty].currentAttempt++;
    }
    updateUsedIcons(currentCombination);

    if (correctPositions === difficulty) {
        currentBoard.completed = true;
        currentBoard.message = '¡Felicidades! Has descubierto la combinación correcta.';
    } else if (gameState[difficulty].currentAttempt >= maxAttempts) {
        currentBoard.completed = true;
        currentBoard.message = 'Se acabaron los intentos.';
    } else {
        currentBoard.message = '';
        gameState[difficulty].currentPosition = 0;
    }

    updateUI();
    if (!onlyUpdate) {
        saveGameState();
    }
}

function updateUsedIcons(currentCombination) { // currentCombination parameter is not strictly needed with this logic but can be kept
    const secret = gameBoards[difficulty].correctCombination;
    const boardState = gameBoards[difficulty].board; // Full board state for current difficulty
    const numAttemptsMade = gameState[difficulty].currentAttempt; // Number of attempts fully processed (checkCombination increments this)

    const newIconStatus = {}; // Object to store new statuses: { iconIndex: 'none' | 'some' | 'all' }

    // 1. Count occurrences of each icon in the secret combination.
    const secretIconCounts = {};
    if (secret && secret.length > 0) { // Ensure secret is not undefined or empty
        for (const icon of secret) {
            secretIconCounts[icon] = (secretIconCounts[icon] || 0) + 1;
        }
    }

    // 2. For each icon type available in the current theme:
    const iconsInTheme = iconThemes[currentTheme].slice(0, difficulty * 3);
    for (let i = 0; i < iconsInTheme.length; i++) {
        const iconIndex = i; // This is the actual icon value (0, 1, 2...)

        if (!(iconIndex in secretIconCounts)) {
            newIconStatus[iconIndex] = 'none'; // Not in secret
            continue;
        }

        // Icon is in secret. Now check if all its instances are correctly placed.
        let countInSecretForThisIcon = secretIconCounts[iconIndex];
        let correctlyPlacedCount = 0;

        // Iterate through all *positions* in the secret code (0 to difficulty-1).
        for (let k = 0; k < secret.length; k++) { // k is a position index in the combination
            if (secret[k] === iconIndex) { // If this position in the secret holds the icon we're currently checking
                // Now, search through all *submitted* attempts to see if this specific position (k)
                // has been revealed with this iconIndex and marked as 'correct-position'.
                let positionRevealedCorrectly = false;
                // numAttemptsMade is the number of attempts already evaluated.
                // If checkCombination was called with onlyUpdate=true, currentAttempt might not have incremented yet.
                // We should iterate up to and including the current attempt if its results are finalized.
                // The `checkCombination` function calls `updateUsedIcons` *after* updating the board state and *before* saving.
                // So, `gameState[difficulty].currentAttempt` might be the *next* attempt if the current one wasn't final,
                // or it's the number of attempts *made* if the game just ended.
                // Let's iterate up to `maxAttempts` to be safe and check boardState.
                for (let attemptIdx = 0; attemptIdx < maxAttempts; attemptIdx++) {
                    if (boardState[attemptIdx] && boardState[attemptIdx][k] &&
                        boardState[attemptIdx][k].icon === iconIndex &&
                        boardState[attemptIdx][k].result === 'correct-position') {
                        positionRevealedCorrectly = true;
                        break; // Found this specific secret position correctly guessed
                    }
                }
                if (positionRevealedCorrectly) {
                    correctlyPlacedCount++;
                }
            }
        }
        
        if (correctlyPlacedCount >= countInSecretForThisIcon) { // Use >= just in case of overcounting from multiple attempts (though logic should prevent)
            newIconStatus[iconIndex] = 'all'; // All instances of this icon found
        } else {
            newIconStatus[iconIndex] = 'some'; // Some (or none yet) are correctly placed, but it's in the secret.
        }
    }
    // Preserve existing statuses if not recalculated (e.g., for icons beyond current theme scope, though unlikely)
    usedIcons[difficulty] = { ...usedIcons[difficulty], ...newIconStatus };
}

function saveGameState() {
    const gameStateKey = `gameState_${selectedDate}`;
    let existingState = JSON.parse(localStorage.getItem(gameStateKey) || '{}');
    
    existingState[difficulty] = {
        board: gameBoards[difficulty],
        gameState: gameState[difficulty],
        usedIcons: usedIcons[difficulty]
    };

    existingState.theme = currentTheme;
    // Removed: existingState.darkMode = document.body.classList.contains('dark-mode');
    
    localStorage.setItem(gameStateKey, JSON.stringify(existingState));
}

function loadGameState(savedState = null) {
    const gameStateKey = `gameState_${selectedDate}`;
    if (!savedState) {
        savedState = JSON.parse(localStorage.getItem(gameStateKey) || '{}');
    }

    if (savedState[difficulty]) {
        gameBoards[difficulty] = savedState[difficulty].board;
        gameState[difficulty] = savedState[difficulty].gameState;
        usedIcons[difficulty] = savedState[difficulty].usedIcons;
    } else {
        // Inicializar nuevo juego para esta dificultad
        gameBoards[difficulty] = {
            board: Array(maxAttempts).fill().map(() => Array(difficulty).fill(null)),
            completed: false,
            message: '',
            correctCombination: generateSecretCombinationForDate(selectedDate, difficulty)
        };
        gameState[difficulty] = { currentAttempt: 0, currentPosition: 0 };
        usedIcons[difficulty] = {};
    }

    currentTheme = savedState.theme || 'lucide';
    iconThemeSelect.value = currentTheme;
    difficultySelect.value = difficulty.toString();

    // Removed dark mode loading logic from here, handled by global script.js
    // The old darkModeToggle button is also removed.

    updateUI();
    updateCalendar();
    lucide.createIcons();
}

// Función para actualizar el calendario
function updateCalendar() {
    const calendarElement = document.getElementById('calendar');
    calendarElement.innerHTML = '';

    const currentMonth = new Date(selectedDate).getMonth();
    const currentYear = new Date(selectedDate).getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Crear encabezado del calendario
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
        <button id="prevMonth">&lt;</button>
        <span>${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}</span>
        <button id="nextMonth">&gt;</button>
    `;
    calendarElement.appendChild(header);

    // Crear días de la semana
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weekdaysElement = document.createElement('div');
    weekdaysElement.className = 'calendar-weekdays';
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        weekdaysElement.appendChild(dayElement);
    });
    calendarElement.appendChild(weekdaysElement);

    // Crear días del mes
    const daysElement = document.createElement('div');
    daysElement.className = 'calendar-days';
    
    // Añadir días vacíos al principio
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        daysElement.appendChild(emptyDay);
    }

    // Añadir días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = i;
        const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        
        if (dateString === selectedDate) {
            dayElement.classList.add('selected-day');
        }

        if (dateString === currentDate) {
            dayElement.classList.add('current-day');
        }

        if (new Date(dateString) <= new Date(currentDate)) {
            dayElement.classList.add('clickable');
            dayElement.addEventListener('click', () => selectDate(dateString));

            // Verificar el estado del juego para este día y dificultad
            const savedState = JSON.parse(localStorage.getItem(`gameState_${dateString}`) || '{}');
            // Remove generic 'completed' or difficulty-specific completed classes for win/loss
            dayElement.classList.remove('completed', 'completed-easy', 'completed-medium', 'completed-hard');

            if (savedState[difficulty] && savedState[difficulty].board && savedState[difficulty].board.completed) {
                const message = savedState[difficulty].board.message;
                if (message && message.includes('¡Felicidades!')) {
                    dayElement.classList.add('day-won');
                } else if (message && message.includes('Se acabaron los intentos')) {
                    dayElement.classList.add('day-lost');
                }
            }
        } else {
            dayElement.classList.add('future-day');
        }

        daysElement.appendChild(dayElement);
    }

    calendarElement.appendChild(daysElement);

    // Event listeners para los botones de navegación
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
}

function changeMonth(delta) {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    selectedDate = newDate.toISOString().split('T')[0];
    updateCalendar();
}

function selectDate(date) {
    if (new Date(date) > new Date(currentDate)) {
        alert('No puedes jugar fechas futuras');
        return;
    }
    selectedDate = date;
    loadGameState();
    updateCalendar();
}

undoButton.addEventListener('click', undoLastSelection);
confirmButton.addEventListener('click', () => checkCombination(false));
// Removed: darkModeToggle.addEventListener('click', ...)

iconThemeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    updateUI();
    saveGameState();
});

difficultySelect.addEventListener('change', (e) => {
    const newDifficulty = parseInt(e.target.value);

    if (newDifficulty !== difficulty) {
        difficulty = newDifficulty;
        loadGameState();  // Cargar el estado para la nueva dificultad
        updateCalendar(); // Actualizar el calendario para reflejar la nueva dificultad
    }
});

window.addEventListener('load', () => {
    initializeGame(true);
    updateCalendar();
});