let towers = [[], [], []];
let selectedTower = null;
let moves = 0;
let highScore = localStorage.getItem('highScore') || 0;

const gameContainer = document.getElementById('game-container');
const movesDisplay = document.getElementById('moves');
const highScoreDisplay = document.getElementById('highScore');
const difficultySelect = document.getElementById('difficulty');
const startGameButton = document.getElementById('startGame');
const darkModeToggle = document.getElementById('darkModeToggle');

function initGame(numDisks) {
    towers = [[], [], []];
    selectedTower = null;
    moves = 0;
    movesDisplay.textContent = `Moves: ${moves}`;
    
    for (let i = numDisks; i > 0; i--) {
        towers[0].push(i);
    }
    
    renderTowers();
}

function renderTowers() {
    gameContainer.innerHTML = '';
    towers.forEach((tower, index) => {
        const towerElement = document.createElement('div');
        towerElement.className = 'tower';
        towerElement.id = `tower${index + 1}`;
        towerElement.addEventListener('click', () => selectTower(index));
        
        tower.forEach(diskSize => {
            const disk = document.createElement('div');
            disk.className = 'disk';
            disk.style.width = `${diskSize * 30}px`;
            disk.style.backgroundColor = `hsl(${diskSize * 30}, 70%, 50%)`;
            towerElement.appendChild(disk);
        });
        
        gameContainer.appendChild(towerElement);
    });
}

function selectTower(index) {
    if (selectedTower === null) {
        if (towers[index].length > 0) {
            selectedTower = index;
            document.getElementById(`tower${index + 1}`).style.backgroundColor = '#bdbdbd';
        }
    } else {
        if (selectedTower !== index) {
            if (towers[index].length === 0 || towers[selectedTower][towers[selectedTower].length - 1] < towers[index][towers[index].length - 1]) {
                const disk = towers[selectedTower].pop();
                towers[index].push(disk);
                moves++;
                movesDisplay.textContent = `Moves: ${moves}`;
                
                if (towers[2].length === parseInt(difficultySelect.value)) {
                    alert(`Congratulations! You completed the game in ${moves} moves.`);
                    if (moves < highScore || highScore === 0) {
                        highScore = moves;
                        localStorage.setItem('highScore', highScore);
                        highScoreDisplay.textContent = `High Score: ${highScore}`;
                    }
                }
            }
        }
        document.getElementById(`tower${selectedTower + 1}`).style.backgroundColor = '';
        selectedTower = null;
        renderTowers();
    }
}

startGameButton.addEventListener('click', () => {
    initGame(parseInt(difficultySelect.value));
});

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    updateDarkModeIcon();
});

function updateDarkModeIcon() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.innerHTML = isDarkMode
        ? '<i data-lucide="sun" aria-hidden="true"></i>'
        : '<i data-lucide="moon" aria-hidden="true"></i>';
    lucide.createIcons();
    darkModeToggle.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
}

// Initialize dark mode based on saved state
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Initialize high score
highScoreDisplay.textContent = `High Score: ${highScore}`;

// Initialize dark mode icon
updateDarkModeIcon();

// Add icon to start game button
startGameButton.innerHTML = '<i data-lucide="play" aria-hidden="true"></i> Start Game';
lucide.createIcons();

// Start the game with default difficulty
initGame(parseInt(difficultySelect.value));