// --- DOM Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const difficultySelect = document.getElementById('difficulty');
const difficultyLabel = document.getElementById('difficulty-label');
const gameOverMessage = document.getElementById('gameOver');
const mobileControls = document.querySelector('.mobile-controls');
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

// --- Game Constants ---
const GRID_SIZE = 20; // Size of each square in the grid
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE;

// --- Difficulty Settings (milliseconds per update) ---
const DIFFICULTIES = {
    easy: 150,
    medium: 100,
    hard: 70,
    insane: 45
};

// --- Game State Variables ---
let snake;          // Array of {x, y} objects representing snake segments
let food;           // {x, y} object for food position
let dx;             // Horizontal velocity (grid units per step)
let dy;             // Vertical velocity (grid units per step)
let score;
let currentDifficulty;
let gameSpeed;
let changingDirection; // Flag to prevent rapid direction reversal
let gameLoopInterval;
let isGameOver;
let highScores;       // Object to store high scores: {easy: 0, medium: 0, hard: 0, insane: 0}

// --- Local Storage Key ---
const HIGH_SCORE_KEY = 'snakeHighScores';

// --- Initialization ---

// Function to load high scores from Local Storage
function loadHighScores() {
    const storedScores = localStorage.getItem(HIGH_SCORE_KEY);
    if (storedScores) {
        highScores = JSON.parse(storedScores);
        // Ensure all difficulty levels exist, even if added later
        Object.keys(DIFFICULTIES).forEach(level => {
            if (highScores[level] === undefined) {
                highScores[level] = 0;
            }
        });
    } else {
        // Initialize if no scores are stored
        highScores = {};
         Object.keys(DIFFICULTIES).forEach(level => {
            highScores[level] = 0;
        });
    }
}

// Function to save high scores to Local Storage
function saveHighScores() {
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
}

// Function to update the displayed high score for the current difficulty
function updateHighScoreDisplay() {
    highScoreElement.textContent = highScores[currentDifficulty] || 0;
    // Update label in the scores display
    const selectedOption = difficultySelect.options[difficultySelect.selectedIndex];
    difficultyLabel.textContent = selectedOption.text;
}

// Function to set up the game state for a new game
function resetGame() {
    // Initial snake position (center)
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);
    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];

    // Initial movement direction (right)
    dx = 1;
    dy = 0;

    // Reset score
    score = 0;
    scoreElement.textContent = score;

    // Place initial food
    createFood();

    // Reset game over state
    isGameOver = false;
    gameOverMessage.style.display = 'none'; // Hide game over message

    // Reset direction change flag
    changingDirection = false;

     // Clear any existing game loop
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }

    // Start the game loop with the current speed
    gameLoopInterval = setInterval(gameLoop, gameSpeed);
}

// Function to set difficulty and reset the game
function setDifficulty(level) {
    currentDifficulty = level;
    gameSpeed = DIFFICULTIES[level];
    updateHighScoreDisplay(); // Update high score display for the new difficulty
    resetGame(); // Reset game state and start loop with new speed
}

// --- Game Logic ---

// Function to draw a single grid square
function drawRect(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    // Optional: Add a border to grid cells
    // ctx.strokeStyle = '#eee';
    // ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

// Function to draw the snake
function drawSnake() {
    snake.forEach((segment, index) => {
        // Make the head slightly different color
        const color = index === 0 ? '#006400' : '#008000'; // Darker green for head
        drawRect(segment.x, segment.y, color);
    });
}

// Function to draw the food
function drawFood() {
    drawRect(food.x, food.y, '#DC143C'); // Crimson red for food
}

// Function to generate food at a random location not occupied by the snake
function createFood() {
    let foodX, foodY, validPosition;
    do {
        validPosition = true;
        foodX = Math.floor(Math.random() * GRID_WIDTH);
        foodY = Math.floor(Math.random() * GRID_HEIGHT);
        // Check if the generated position is on the snake
        snake.forEach(segment => {
            if (segment.x === foodX && segment.y === foodY) {
                validPosition = false;
            }
        });
    } while (!validPosition);

    food = { x: foodX, y: foodY };
}

// Function to move the snake
function moveSnake() {
    // Calculate new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    // Add new head to the beginning of the snake array
    snake.unshift(head);

    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score++;
        scoreElement.textContent = score;
        // Create new food
        createFood();
        // Don't remove tail segment (snake grows)
    } else {
        // Remove the last segment of the snake's tail
        snake.pop();
    }
}

// Function to check for collisions (walls or self)
function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        return true;
    }

    // Self collision (check if head collides with any other segment)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// Function called when the game ends
function endGame() {
    isGameOver = true;
    clearInterval(gameLoopInterval); // Stop the game loop
    gameOverMessage.style.display = 'block'; // Show game over message

    // Check and update high score for the current difficulty
    if (score > (highScores[currentDifficulty] || 0)) {
        highScores[currentDifficulty] = score;
        saveHighScores(); // Save updated scores to Local Storage
        updateHighScoreDisplay(); // Update display immediately
    }
}

// --- Main Game Loop ---
function gameLoop() {
    if (isGameOver) return; // Don't run if game is over

    changingDirection = false; // Allow direction change for the next frame

    // 1. Clear canvas
    ctx.fillStyle = '#f8f8f8'; // Background color
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Move snake
    moveSnake();

    // 3. Check for collision
    if (checkCollision()) {
        endGame();
        return; // Exit loop immediately on game over
    }

    // 4. Draw elements
    drawFood();
    drawSnake();
}

// --- Event Listeners ---

// Keyboard input
function handleKeyDown(event) {
    if (changingDirection) return; // Prevent changing direction multiple times per frame

    const key = event.key; // Use event.key for modern browsers

    // If game is over, allow Enter to restart
    if (isGameOver && key === 'Enter') {
        resetGame();
        return;
    }
     if (isGameOver) return; // Ignore movement keys if game over

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingLeft = dx === -1;
    const goingRight = dx === 1;

    // Change direction based on key press, preventing 180-degree turns
    if ((key === 'ArrowLeft' || key.toLowerCase() === 'a') && !goingRight) {
        dx = -1; dy = 0; changingDirection = true;
    } else if ((key === 'ArrowUp' || key.toLowerCase() === 'w') && !goingDown) {
        dx = 0; dy = -1; changingDirection = true;
    } else if ((key === 'ArrowRight' || key.toLowerCase() === 'd') && !goingLeft) {
        dx = 1; dy = 0; changingDirection = true;
    } else if ((key === 'ArrowDown' || key.toLowerCase() === 's') && !goingUp) {
        dx = 0; dy = 1; changingDirection = true;
    }
}

// Difficulty change
function handleDifficultyChange() {
    setDifficulty(difficultySelect.value);
}

// Mobile button controls
function handleMobileControls(direction) {
    if (isGameOver) {
        // Allow restart via mobile buttons if game over
        resetGame();
        return;
    }
    if (changingDirection) return;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingLeft = dx === -1;
    const goingRight = dx === 1;

    if (direction === 'up' && !goingDown) {
        dx = 0; dy = -1; changingDirection = true;
    } else if (direction === 'down' && !goingUp) {
        dx = 0; dy = 1; changingDirection = true;
    } else if (direction === 'left' && !goingRight) {
        dx = -1; dy = 0; changingDirection = true;
    } else if (direction === 'right' && !goingLeft) {
        dx = 1; dy = 0; changingDirection = true;
    }
}

// Check if touch events are supported to show mobile controls
function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// --- Setup ---
document.addEventListener('keydown', handleKeyDown);
difficultySelect.addEventListener('change', handleDifficultyChange);

// Setup Mobile Controls if applicable
if (isTouchDevice()) {
    mobileControls.style.display = 'flex'; // Show controls on touch devices
    // Use 'touchstart' for faster response on mobile than 'click'
    btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileControls('up'); }, { passive: false });
    btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileControls('down'); }, { passive: false });
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileControls('left'); }, { passive: false });
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileControls('right'); }, { passive: false });

     // Add click listeners as fallback and for desktop testing of mobile layout
    btnUp.addEventListener('click', () => handleMobileControls('up'));
    btnDown.addEventListener('click', () => handleMobileControls('down'));
    btnLeft.addEventListener('click', () => handleMobileControls('left'));
    btnRight.addEventListener('click', () => handleMobileControls('right'));

    // Also allow restart by tapping the game over message on mobile
    gameOverMessage.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isGameOver) resetGame();
    }, { passive: false });
} else {
    mobileControls.style.display = 'none'; // Ensure controls are hidden if not touch
}

// Allow restart by clicking game over message on desktop too
gameOverMessage.addEventListener('click', () => {
    if (isGameOver) resetGame();
});


// --- Initial Game Start ---
loadHighScores(); // Load scores first
setDifficulty(difficultySelect.value); // Set initial difficulty and start the game
