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
const darkModeToggle = document.getElementById('darkModeToggle');
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

function initializeGame() {
    const currentDate = new Date().toDateString();
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');

    gameState = {
        3: { currentAttempt: 0, currentPosition: 0 },
        4: { currentAttempt: 0, currentPosition: 0 },
        5: { currentAttempt: 0, currentPosition: 0 }
    };

    usedIcons = {
        3: {},
        4: {},
        5: {}
    };

    if (lastPlayedDate !== currentDate) {
        for (let diff of [3, 4, 5]) {
            difficulty = diff;
            generateSecretCombination();
            gameBoards[diff] = {
                board: Array(maxAttempts).fill().map(() => Array(diff).fill(null)),
                completed: false,
                message: '',
                correctCombination: [...secretCombination]
            };
        }
        localStorage.setItem('lastPlayedDate', currentDate);
    }
    updateUI();
    saveGameState();
}

function updateUI() {
    // Limpiar el tablero de juego y el selector de iconos
    gameBoardElement.innerHTML = '';
    iconSelectorElement.innerHTML = '';

    // Configurar la cuadrícula del tablero de juego
    gameBoardElement.style.gridTemplateColumns = `repeat(${difficulty}, 1fr)`;

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

function updateUsedIcons(currentCombination) {
    // Inicializar el conteo de iconos en la combinación secreta
    const iconCounts = {};
    gameBoards[difficulty].correctCombination.forEach((icon, index) => {
        iconCounts[icon] = (iconCounts[icon] || 0) + 1;
    });

    // Inicializar usedIcons para la dificultad actual si no existe
    if (!usedIcons[difficulty]) {
        usedIcons[difficulty] = {};
    }

    // Procesar cada icono en la combinación actual
    currentCombination.forEach((icon, index) => {
        if (gameBoards[difficulty].correctCombination[index] === icon) {
            // El icono está en la posición correcta
            usedIcons[difficulty][icon] = 'all';
            iconCounts[icon]--;
        } else if (iconCounts[icon] > 0) {
            // El icono está presente pero en posición incorrecta
            usedIcons[difficulty][icon] = usedIcons[difficulty][icon] === 'all' ? 'all' : 'some';
        } else if (!usedIcons[difficulty][icon]) {
            // El icono no está presente en la combinación secreta
            usedIcons[difficulty][icon] = 'none';
        }
    });
}

function saveGameState() {
    const gameStateToSave = {
        theme: currentTheme,
        difficulty: difficulty,
        boards: gameBoards,
        gameState: gameState,
        usedIcons: usedIcons,
        darkMode: document.body.classList.contains('dark-mode'),
        lastPlayedDate: new Date().toDateString()
    };
    localStorage.setItem('gameState', JSON.stringify(gameStateToSave));
}

function loadGameState() {
    const savedState = localStorage.getItem('gameState');

    if (savedState) {
        const parsedState = JSON.parse(savedState);

        currentTheme = parsedState.theme;
        difficulty = parsedState.difficulty;

        gameBoards = parsedState.boards;
        gameState = parsedState.gameState;
        usedIcons = parsedState.usedIcons;

        iconThemeSelect.value = currentTheme;
        difficultySelect.value = difficulty.toString();

        if (parsedState.darkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.querySelector('svg').setAttribute('data-lucide', 'sun');
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.querySelector('svg').setAttribute('data-lucide', 'moon');
        }
    } else {
        initializeGame();
    }

    updateUI();
    lucide.createIcons();
}

undoButton.addEventListener('click', undoLastSelection);
confirmButton.addEventListener('click', () => checkCombination(false));
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = darkModeToggle.querySelector('svg');

    if (document.body.classList.contains('dark-mode')) {
        icon.setAttribute('data-lucide', 'sun');
    } else {
        icon.setAttribute('data-lucide', 'moon');
    }

    lucide.createIcons();
    saveGameState();
});

iconThemeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    updateUI();
    saveGameState();
});

difficultySelect.addEventListener('change', (e) => {
    const newDifficulty = parseInt(e.target.value);

    if (newDifficulty !== difficulty) {
        difficulty = newDifficulty;
        if (!gameBoards[difficulty].correctCombination.length) {
            generateSecretCombination();
        }
        updateUI();
        saveGameState();
    }
});

window.addEventListener('load', loadGameState);