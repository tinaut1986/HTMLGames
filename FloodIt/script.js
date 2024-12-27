const COLORS = ['#ff4136', '#0074d9', '#2ecc40', '#ffdc00', '#b10dc9', '#fa7e48'];
const DIFFICULTIES = {
   easy: { size: 10, maxMoves: 25 },
   medium: { size: 14, maxMoves: 25 },
   hard: { size: 18, maxMoves: 25 }
};

let grid = [];
let moves = 0;
let gameOver = false;
let difficulty = 'medium';
let score = 0;
let highScore = localStorage.getItem('floodItHighScore') || 0;

const gridElement = document.getElementById('grid');
const colorButtonsElement = document.getElementById('colorButtons');
const difficultySelect = document.getElementById('difficulty');
const restartButton = document.getElementById('restartButton');
const movesElement = document.getElementById('moves');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const darkModeToggle = document.getElementById('darkModeToggle');

/// Creates a grid of specified size filled with random colors from the COLORS array.
function createGrid(size) {
   return Array(size).fill().map(() => 
       Array(size).fill().map(() => COLORS[Math.floor(Math.random() * COLORS.length)])
   );
}

/// Performs the flood fill algorithm to change the color of connected cells.
function flood(newGrid, color, row, col, originalColor) {
   // Check if the current position is out of bounds or not matching the original color
   if (row < 0 || row >= newGrid.length || col < 0 || col >= newGrid[0].length || newGrid[row][col] !== originalColor) {
       return newGrid;
   }

   // Change the color of the current cell
   newGrid[row][col] = color;

   // Recursively call flood on adjacent cells
   flood(newGrid, color, row + 1, col, originalColor);
   flood(newGrid, color, row - 1, col, originalColor);
   flood(newGrid, color, row, col + 1, originalColor);
   flood(newGrid, color, row, col - 1, originalColor);

   return newGrid;
}

/// Renders the current grid in the HTML element.
function renderGrid() {
   gridElement.innerHTML = '';
   gridElement.style.gridTemplateColumns = `repeat(${grid.length}, 1fr)`;
   grid.forEach(row => {
       row.forEach(color => {
           const cell = document.createElement('div');
           cell.className = 'cell';
           cell.style.backgroundColor = color;
           gridElement.appendChild(cell);
       });
   });
}

/// Renders color buttons based on available colors and disables them if necessary.
function renderColorButtons() {
   colorButtonsElement.innerHTML = '';
   COLORS.forEach(color => {
       const button = document.createElement('button');
       button.className = 'color-button';
       button.style.backgroundColor = color;

       // Disable button if game is over or maximum moves are reached
       button.disabled = gameOver || moves >= DIFFICULTIES[difficulty].maxMoves;

       button.onclick = () => handleColorClick(color);
       colorButtonsElement.appendChild(button);
   });
}

/// Updates the displayed information about moves, score and high score.
function updateInfo() {
   movesElement.textContent = `Moves: ${moves} / ${DIFFICULTIES[difficulty].maxMoves}`;
   scoreElement.textContent = `Score: ${score}`;
   highScoreElement.textContent = `High Score: ${highScore}`;
}

/// Handles the click event on a color button and updates the game state accordingly.
function handleColorClick(color) {
   if (gameOver || moves >= DIFFICULTIES[difficulty].maxMoves) return;

   // Check if the selected color is the same as the current one
   if (color === grid[0][0]) return;

   // Update grid with new color and increment moves
   grid = flood([...grid], color, 0, 0, grid[0][0]);
   moves++;
   
   const baseScore = DIFFICULTIES[difficulty].size * 10;
   const movesLeft = DIFFICULTIES[difficulty].maxMoves - moves;

   // Calculate score based on remaining moves
   score += baseScore + (movesLeft * 5);

   renderGrid();
   renderColorButtons();
   updateInfo();
   checkGameOver();
}

/// Checks for game over conditions (win or lose).
function checkGameOver() {
    const isWon = grid.every(row => row.every(cell => cell === grid[0][0]));
    const isLost = moves >= DIFFICULTIES[difficulty].maxMoves;

    if (isWon || isLost) {
        gameOver = true;

        if (isWon) {
            if (score > highScore) {
                highScore = score; 
                localStorage.setItem('floodItHighScore', highScore);
            }
            alert('You won!');
        } else {
            alert('Game Over! You ran out of moves.');
        }
    }
}

/// Initializes a new game based on the selected difficulty level.
function initGame() {
    const { size } = DIFFICULTIES[difficulty];
   
    difficultySelect.value = difficulty;

    grid = createGrid(size);
   
    gameOver = false;
    moves = 0;
    score = 0;

    renderGrid();
    renderColorButtons();
    updateInfo();
}

// Event listener for changing difficulty
difficultySelect.onchange = (e) => {
    difficulty = e.target.value; 
    initGame(); 
};

// Event listener for restarting the game
restartButton.onclick = initGame;

/// Toggles dark mode for better user experience at night.
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Event listener for dark mode toggle
darkModeToggle.onclick = toggleDarkMode;

// Load dark mode preference from local storage
if (localStorage.getItem('darkMode') === 'true') {
     document.body.classList.add('dark-mode');
}

// Easter egg sequence detection
let easterEggSequence = [];
const EASTER_EGG_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
     easterEggSequence.push(e.key);
     easterEggSequence = easterEggSequence.slice(-EASTER_EGG_CODE.length);
     
     if (easterEggSequence.join(',') === EASTER_EGG_CODE.join(',')) {
         activateRainbowMode();
     }
});

// Activates a rainbow animation as an Easter egg.
function activateRainbowMode() {
     alert('Rainbow mode activated!');
     document.body.style.animation = 'rainbow 5s linear infinite';
}

// Initialize the game on page load
initGame();
