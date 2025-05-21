let towers = [[], [], []];
let selectedTower = null;
let moves = 0;
let highScore = localStorage.getItem('highScore') || 0;

const gameContainer = document.getElementById('game-container');
const movesDisplay = document.getElementById('moves');
const highScoreDisplay = document.getElementById('highScore');
const difficultySelect = document.getElementById('difficulty');
const startGameButton = document.getElementById('startGame');
// Removed: const darkModeToggle = document.getElementById('darkModeToggle');

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
    // Deselect previous tower visually if any
    const currentlySelectedElement = document.querySelector('.tower.selected');
    if (currentlySelectedElement) {
        currentlySelectedElement.classList.remove('selected');
    }

    if (selectedTower === null) { // Selecting a tower to pick up a disk
        if (towers[index].length > 0) {
            selectedTower = index;
            document.getElementById(`tower${index + 1}`).classList.add('selected');
        }
    } else { // Moving the disk from selectedTower to tower 'index'
        if (selectedTower !== index) { // Not clicking the same tower
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
                    // Potentially reset or disable further moves until new game
                }
            } else {
                // Invalid move - clicked tower has smaller disk on top or trying to move to same tower implicitly
                // Visual feedback for invalid move could be added here if desired
            }
        }
        // Always deselect tower and re-render after an attempt (successful or not, or clicking same tower)
        selectedTower = null; 
        renderTowers(); // Re-render to remove 'selected' class from all towers and update disk positions
    }
}

startGameButton.addEventListener('click', () => {
    initGame(parseInt(difficultySelect.value));
});

// Removed: darkModeToggle click listener
// Removed: updateDarkModeIcon function
// Removed: Initial dark mode loading logic (localStorage.getItem('darkMode'))

// Initialize high score
highScoreDisplay.textContent = `High Score: ${highScore}`;

// Add icon to start game button
startGameButton.innerHTML = '<i data-lucide="play" aria-hidden="true"></i> Start Game';
lucide.createIcons();

// Start the game with default difficulty
initGame(parseInt(difficultySelect.value));