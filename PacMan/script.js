// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const difficultySelect = document.getElementById('difficulty');
const difficultyLabelEl = document.getElementById('difficulty-label');
const gameOverMessageEl = document.getElementById('gameOverMessage');
const livesCountEl = document.getElementById('livesCount');

// Mobile Controls (optional, if you implement them)
const btnUp = document.getElementById('btnUp');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnDown = document.getElementById('btnDown');

// Game constants
const GRID_SIZE = 16; 
const PACMAN_COLOR = 'yellow';
const WALL_COLOR = '#1919A6'; 
const PELLET_COLOR = '#FFB8AE';
const POWER_PELLET_COLOR = '#FFE0B2';
const PELLET_RADIUS = 3;
const POWER_PELLET_RADIUS = 7;
const FRIGHTENED_COLOR = '#2980B9'; // Distinct blue for frightened ghosts
const POINTS_FOR_EATING_GHOST = 200;

const ROWS = 30;
const COLS = 28;

// Difficulty Settings
const DIFFICULTIES = {
    easy: { gameSpeed: 180, ghostSpeedMultiplier: 0.7, powerPelletDuration: 8000 },
    medium: { gameSpeed: 150, ghostSpeedMultiplier: 0.85, powerPelletDuration: 6000 },
    hard: { gameSpeed: 120, ghostSpeedMultiplier: 1.0, powerPelletDuration: 4000 }
};
let currentDifficulty = 'easy'; 
let currentDifficultySettings = DIFFICULTIES[currentDifficulty];

// High Score Management
let highScores = {};
const localStorageKey = 'pacmanHighScores';

// Maze definition
const maze_template = [ // Renamed to maze_template for clarity on reset
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1], 
    [1,1,1,1,1,1,0,1,1,0,1,1,1,4,4,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,1,4,4,4,4,4,4,1,0,1,1,0,1,1,1,1,1,1], 
    [1,1,1,1,1,1,0,1,1,0,1,4,4,4,4,4,4,1,0,1,1,0,1,1,1,1,1,1], 
    [1,1,1,1,1,1,0,1,1,0,1,4,4,4,4,4,4,1,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1], 
    [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1], 
    [1,1,0,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1],
    [1,1,0,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
let maze = JSON.parse(JSON.stringify(maze_template)); // Working copy of the maze


const pacman = {
    x: 13, y: 23, radius: GRID_SIZE / 2 - 2, speed: 1, dx: 0, dy: 0,
    nextDx: 0, nextDy: 0, rotation: 0, nextRotation: 0,
    mouthOpenValue: Math.PI / 4, mouthAngle: 0.05,
    mouthChangeDirection: 1, mouthChangeSpeed: 0.07,
    isMoving: false, lives: 3
};

const GHOST_START_POSITIONS = [
    { x: 13.5, y: 11.0, dx: 0, dy: -1, color: 'red', name: 'Blinky' },
    { x: 11.5, y: 14.0, dx: -1, dy: 0, color: 'pink', name: 'Pinky' },
    { x: 13.5, y: 14.0, dx: 0, dy: -1, color: 'cyan', name: 'Inky' },
    { x: 15.5, y: 14.0, dx: 1, dy: 0, color: 'orange', name: 'Clyde' }
];
let ghosts = [];

let score = 0;
let isGameOver = false;
let gameLoopInterval;
let totalPelletCount = 0;
let temporaryEnterListener = null; 

function loadHighScores() {
    const storedScores = localStorage.getItem(localStorageKey);
    if (storedScores) highScores = JSON.parse(storedScores);
    else highScores = {}; 
    for (const diff in DIFFICULTIES) {
        if (!highScores[diff]) highScores[diff] = 0;
    }
}

function saveHighScores() {
    localStorage.setItem(localStorageKey, JSON.stringify(highScores));
}

function updateHighScoreDisplay() {
    highScoreEl.textContent = highScores[currentDifficulty];
    const selectedOption = difficultySelect.options[difficultySelect.selectedIndex];
    if (selectedOption) difficultyLabelEl.textContent = selectedOption.text;
    else if (difficultySelect.options.length > 0) difficultyLabelEl.textContent = difficultySelect.options[0].text;
    else difficultyLabelEl.textContent = currentDifficulty;
}

function createGhosts() {
    ghosts.forEach(ghost => { // Clear any existing respawn timeouts
        if (ghost.respawnTimeoutId) clearTimeout(ghost.respawnTimeoutId);
    });
    ghosts = [];
    GHOST_START_POSITIONS.forEach(config => {
        ghosts.push({
            ...config, // spread initial config
            x: config.x, y: config.y, startX: config.x, startY: config.y,
            radius: GRID_SIZE / 2 - 2, speed: 1, 
            isFrightened: false, frightenedTimer: 0, isVisible: true,
            respawnTimeoutId: null
        });
    });
}

function initializeBoard() {
    totalPelletCount = 0;
    maze = JSON.parse(JSON.stringify(maze_template)); // Reset maze from template
    const powerPelletLocations = [{r:3, c:1}, {r:3, c:26}, {r:23, c:1}, {r:23, c:26}];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (maze[r][c] === 0) maze[r][c] = 2; 
            let isPowerPellet = powerPelletLocations.some(loc => loc.r === r && loc.c === c);
            if (isPowerPellet) maze[r][c] = 3; 
            if (maze[r][c] === 2 || maze[r][c] === 3) totalPelletCount++;
        }
    }
    console.log("Total pellets to eat:", totalPelletCount);
}

function updatePacmanAnimation() {
    if (pacman.isMoving) {
        pacman.mouthAngle += pacman.mouthChangeSpeed * pacman.mouthChangeDirection;
        if (pacman.mouthAngle > pacman.mouthOpenValue || pacman.mouthAngle < 0) {
            pacman.mouthChangeDirection *= -1;
            pacman.mouthAngle = Math.max(0, Math.min(pacman.mouthAngle, pacman.mouthOpenValue));
        }
    } else pacman.mouthAngle = Math.PI / 12; 
}

function handleDifficultyChange(event) {
    currentDifficulty = event.target.value;
    currentDifficultySettings = DIFFICULTIES[currentDifficulty];
    updateHighScoreDisplay(); resetGame(); 
}

function handleKeyDown(event) {
    const key = event.key;
    if (isGameOver && !temporaryEnterListener) { 
         if (key === 'Enter' && totalPelletCount === 0) resetGame();
         return;
    }
    if (isGameOver && temporaryEnterListener) return; 
    let intendedNewDx = pacman.nextDx; let intendedNewDy = pacman.nextDy; let newRotation = pacman.nextRotation;
    if (key === 'ArrowUp') { intendedNewDx = 0; intendedNewDy = -1; newRotation = Math.PI * 1.5; }
    else if (key === 'ArrowDown') { intendedNewDx = 0; intendedNewDy = 1; newRotation = Math.PI * 0.5; }
    else if (key === 'ArrowLeft') { intendedNewDx = -1; intendedNewDy = 0; newRotation = Math.PI; }
    else if (key === 'ArrowRight') { intendedNewDx = 1; intendedNewDy = 0; newRotation = 0; }
    pacman.nextDx = intendedNewDx; pacman.nextDy = intendedNewDy; pacman.nextRotation = newRotation;
}

function movePacman() {
    if (pacman.nextDx !== 0 || pacman.nextDy !== 0) {
        const potentialNextX = pacman.x + pacman.nextDx; const potentialNextY = pacman.y + pacman.nextDy;
        if (potentialNextY >= 0 && potentialNextY < ROWS && potentialNextX >= 0 && potentialNextX < COLS &&
            maze[potentialNextY][potentialNextX] !== 1 && maze[potentialNextY][potentialNextX] !== 4) {
            pacman.dx = pacman.nextDx; pacman.dy = pacman.nextDy; pacman.rotation = pacman.nextRotation;
            pacman.nextDx = 0; pacman.nextDy = 0;
        }
    }
    let targetX = pacman.x + pacman.dx; let targetY = pacman.y + pacman.dy;
    if (pacman.y === 14) { 
        if (targetX < 0 && pacman.dx === -1) { pacman.x = COLS - 1; pacman.isMoving = true; return;}
        else if (targetX >= COLS && pacman.dx === 1) { pacman.x = 0; pacman.isMoving = true; return;}
    }
    if (targetY >= 0 && targetY < ROWS && targetX >= 0 && targetX < COLS &&
        maze[targetY][targetX] !== 1 && maze[targetY][targetX] !== 4) {
        pacman.x = targetX; pacman.y = targetY; pacman.isMoving = true;
    } else pacman.isMoving = false;
}

function checkEating() {
    const tileAtPacman = maze[pacman.y][pacman.x];
    if (tileAtPacman === 2) { 
        maze[pacman.y][pacman.x] = 0; score += 10; totalPelletCount--; currentScoreEl.textContent = score;
    } else if (tileAtPacman === 3) { 
        maze[pacman.y][pacman.x] = 0; score += 50; totalPelletCount--; currentScoreEl.textContent = score;
        console.log("Power Pellet Eaten! Duration:", currentDifficultySettings.powerPelletDuration);
        ghosts.forEach(ghost => {
            if (ghost.isVisible) { // Only affect visible, non-eaten ghosts
                ghost.isFrightened = true;
                ghost.frightenedTimer = currentDifficultySettings.powerPelletDuration;
                if (ghost.dx !== 0 || ghost.dy !== 0) { // Reverse direction if moving
                    ghost.dx *= -1; ghost.dy *= -1;
                } else { // If static, assign a random valid direction
                    const validMoves = [];
                    const gX = Math.floor(ghost.x), gY = Math.floor(ghost.y);
                    if (gY > 0 && maze[gY-1][gX] !== 1) validMoves.push({dx:0,dy:-1});
                    if (gY < ROWS-1 && maze[gY+1][gX] !== 1) validMoves.push({dx:0,dy:1});
                    if (gX > 0 && maze[gY][gX-1] !== 1) validMoves.push({dx:-1,dy:0});
                    if (gX < COLS-1 && maze[gY][gX+1] !== 1) validMoves.push({dx:1,dy:0});
                    if(validMoves.length > 0) {
                        const move = validMoves[Math.floor(Math.random()*validMoves.length)];
                        ghost.dx = move.dx; ghost.dy = move.dy;
                    }
                }
            }
        });
    }
    if (score > highScores[currentDifficulty]) {
        highScores[currentDifficulty] = score; updateHighScoreDisplay(); saveHighScores();
    }
}

function updateGhosts() {
    ghosts.forEach(ghost => {
        if (!ghost.isVisible) return;
        if (ghost.isFrightened) {
            ghost.frightenedTimer -= currentDifficultySettings.gameSpeed;
            if (ghost.frightenedTimer <= 0) {
                ghost.isFrightened = false;
                // Find original config for this ghost to reset color if needed, though drawing handles it.
                // Speed reset would happen here if we changed it.
            }
        }
        // Movement logic (same for frightened for now, can be different)
        const currentGridX = Math.floor(ghost.x); const currentGridY = Math.floor(ghost.y);
        const isAligned = (Math.abs(ghost.x - currentGridX) < 0.05 && Math.abs(ghost.y - currentGridY) < 0.05) ||
                          (Math.abs(ghost.x - (currentGridX + 0.5)) < 0.05 && Math.abs(ghost.y - (currentGridY + 0.5)) < 0.05);
        let wallAhead = false;
        if (ghost.dx !== 0 || ghost.dy !== 0) {
             const checkXWall = currentGridX + ghost.dx; const checkYWall = currentGridY + ghost.dy;
             if (checkXWall < 0 || checkXWall >= COLS || checkYWall < 0 || checkYWall >= ROWS || maze[checkYWall][checkXWall] === 1) {
                 wallAhead = true;
             }
        }
        if (isAligned && (wallAhead || (ghost.dx === 0 && ghost.dy === 0) || Math.random() < 0.25) ) {
            const possibleMoves = []; const validGhostTiles = [0, 2, 3, 4]; 
            const allowReverse = ghost.isFrightened; // Frightened ghosts might reverse more freely
            if (currentGridY > 0 && validGhostTiles.includes(maze[currentGridY - 1][currentGridX]) && (allowReverse || !(ghost.dx === 0 && ghost.dy === 1))) possibleMoves.push({dx:0, dy:-1});
            if (currentGridY < ROWS - 1 && validGhostTiles.includes(maze[currentGridY + 1][currentGridX]) && (allowReverse || !(ghost.dx === 0 && ghost.dy === -1))) possibleMoves.push({dx:0, dy:1});
            if (currentGridX > 0 && validGhostTiles.includes(maze[currentGridY][currentGridX - 1]) && (allowReverse || !(ghost.dx === 1 && ghost.dy === 0))) possibleMoves.push({dx:-1, dy:0});
            if (currentGridX < COLS - 1 && validGhostTiles.includes(maze[currentGridY][currentGridX + 1]) && (allowReverse || !(ghost.dx === -1 && ghost.dy === 0))) possibleMoves.push({dx:1, dy:0});
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                ghost.dx = randomMove.dx; ghost.dy = randomMove.dy;
            } else if (ghost.dx !== 0 || ghost.dy !==0) { ghost.dx *= -1; ghost.dy *= -1; }
        }
        const nextGridX = currentGridX + ghost.dx; const nextGridY = currentGridY + ghost.dy;
        if (ghost.dx !== 0 || ghost.dy !== 0) { 
            if (nextGridY >= 0 && nextGridY < ROWS && nextGridX >= 0 && nextGridX < COLS &&
                (maze[nextGridY][nextGridX] === 0 || maze[nextGridY][nextGridX] === 2 || maze[nextGridY][nextGridX] === 3 || maze[nextGridY][nextGridX] === 4)) {
                ghost.x = nextGridX; ghost.y = nextGridY;
            } else { if(isAligned) { ghost.dx = 0; ghost.dy = 0; } }
        }
    });
}

function checkPacmanGhostCollision() {
    if (isGameOver && temporaryEnterListener) return; 
    for (const ghost of ghosts) {
        if (!ghost.isVisible) continue;
        const pacmanGridX = Math.floor(pacman.x); const pacmanGridY = Math.floor(pacman.y);
        const ghostGridX = Math.floor(ghost.x); const ghostGridY = Math.floor(ghost.y);
        if (pacmanGridX === ghostGridX && pacmanGridY === ghostGridY) {
            if (ghost.isFrightened) {
                score += POINTS_FOR_EATING_GHOST; currentScoreEl.textContent = score;
                if (score > highScores[currentDifficulty]) {
                    highScores[currentDifficulty] = score; updateHighScoreDisplay(); saveHighScores();
                }
                ghost.isFrightened = false; ghost.isVisible = false; 
                if(ghost.respawnTimeoutId) clearTimeout(ghost.respawnTimeoutId); // Clear existing before setting new
                ghost.respawnTimeoutId = setTimeout(() => {
                    ghost.x = ghost.startX; ghost.y = ghost.startY; 
                    ghost.isVisible = true; 
                    const originalConfig = GHOST_START_POSITIONS.find(g => g.name === ghost.name);
                    ghost.dx = originalConfig.dx; ghost.dy = originalConfig.dy;
                    ghost.isFrightened = false; // Ensure it's not frightened on respawn
                }, 5000); // Respawn after 5 seconds
            } else {
                handlePacmanDeath(); return; 
            }
        }
    }
}

function handlePacmanDeath() {
    pacman.lives--; livesCountEl.textContent = pacman.lives;
    pacman.isMoving = false; isGameOver = true; 
    clearInterval(gameLoopInterval);
    if (temporaryEnterListener) document.removeEventListener('keydown', temporaryEnterListener);
    temporaryEnterListener = (event) => {
        if (event.key === 'Enter') {
            document.removeEventListener('keydown', temporaryEnterListener); temporaryEnterListener = null; 
            if (pacman.lives > 0) resumeAfterDeath(); else resetGame();
        }
    };
    document.addEventListener('keydown', temporaryEnterListener);
    gameOverMessageEl.textContent = pacman.lives > 0 ? "¡Atrapado! Presiona Enter para continuar." : "¡Juego Terminado! Presiona Enter para reiniciar.";
    gameOverMessageEl.style.display = 'block';
}

function resumeAfterDeath() {
    isGameOver = false; gameOverMessageEl.style.display = 'none';
    pacman.x = 13; pacman.y = 23; pacman.dx = 0; pacman.dy = 0;
    pacman.nextDx = 0; pacman.nextDy = 0; pacman.rotation = 0; pacman.isMoving = false;
    createGhosts(); 
    if (gameLoopInterval) clearInterval(gameLoopInterval); 
    gameLoopInterval = setInterval(gameLoop, currentDifficultySettings.gameSpeed);
}

function gameLoop() {
    if (isGameOver && !temporaryEnterListener) return;
    if (isGameOver && temporaryEnterListener) return;
    movePacman(); checkEating(); updatePacmanAnimation(); 
    updateGhosts(); checkPacmanGhostCollision(); 
    drawGame();
    if (totalPelletCount === 0 && !isGameOver) { 
        isGameOver = true; 
        gameOverMessageEl.textContent = "¡Nivel Superado! Presiona Enter para reiniciar.";
        gameOverMessageEl.style.display = 'block';
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        console.log("Level Cleared!");
        if (temporaryEnterListener) document.removeEventListener('keydown', temporaryEnterListener);
        temporaryEnterListener = (event) => {
            if (event.key === 'Enter') {
                document.removeEventListener('keydown', temporaryEnterListener); temporaryEnterListener = null;
                resetGame();
            }
        };
        document.addEventListener('keydown', temporaryEnterListener);
    }
}

function resetGame() {
    console.log("Resetting game with difficulty:", currentDifficulty, "Speed:", currentDifficultySettings.gameSpeed);
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (temporaryEnterListener) { 
        document.removeEventListener('keydown', temporaryEnterListener); temporaryEnterListener = null;
    }
    // Clear any active ghost respawn timeouts
    ghosts.forEach(ghost => {
        if (ghost.respawnTimeoutId) clearTimeout(ghost.respawnTimeoutId);
    });

    createGhosts(); 
    pacman.lives = 3; livesCountEl.textContent = pacman.lives;
    pacman.x = 13; pacman.y = 23; pacman.dx = 0; pacman.dy = 0;
    pacman.nextDx = 0; pacman.nextDy = 0; pacman.rotation = 0; pacman.isMoving = false;
    pacman.mouthAngle = 0.05; 
    score = 0; currentScoreEl.textContent = score;
    isGameOver = false; gameOverMessageEl.style.display = 'none';
    initializeBoard(); 
    updateHighScoreDisplay(); 
    gameLoopInterval = setInterval(gameLoop, currentDifficultySettings.gameSpeed);
    drawGame(); 
}

function init() {
    loadHighScores();
    currentDifficulty = difficultySelect.value;
    currentDifficultySettings = DIFFICULTIES[currentDifficulty];
    const selectedOption = difficultySelect.options[difficultySelect.selectedIndex];
    if (selectedOption) difficultyLabelEl.textContent = selectedOption.text;
    difficultySelect.addEventListener('change', handleDifficultyChange);
    document.addEventListener('keydown', handleKeyDown);
    resetGame(); 
}

function drawGame() {
    ctx.fillStyle = 'black'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const tile = maze[row][col];
            const centerX = col * GRID_SIZE + GRID_SIZE / 2; const centerY = row * GRID_SIZE + GRID_SIZE / 2;
            if (tile === 1 || tile === 4) { 
                ctx.fillStyle = WALL_COLOR; ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            } else if (tile === 2) { 
                ctx.fillStyle = PELLET_COLOR; ctx.beginPath(); ctx.arc(centerX, centerY, PELLET_RADIUS, 0, Math.PI * 2); ctx.fill();
            } else if (tile === 3) { 
                ctx.fillStyle = POWER_PELLET_COLOR; ctx.beginPath(); ctx.arc(centerX, centerY, POWER_PELLET_RADIUS, 0, Math.PI * 2); ctx.fill();
            }
        }
    }
    const pacmanPixelX = pacman.x * GRID_SIZE + GRID_SIZE / 2; const pacmanPixelY = pacman.y * GRID_SIZE + GRID_SIZE / 2;
    ctx.fillStyle = PACMAN_COLOR; ctx.beginPath();
    const currentMouthAngle = Math.max(0, pacman.mouthAngle);
    ctx.arc(pacmanPixelX, pacmanPixelY, pacman.radius, currentMouthAngle + pacman.rotation, (Math.PI * 2) - currentMouthAngle + pacman.rotation);
    ctx.lineTo(pacmanPixelX, pacmanPixelY); ctx.fill();

    ghosts.forEach(ghost => {
        if (!ghost.isVisible) return;
        const ghostRenderX = ghost.x * GRID_SIZE + GRID_SIZE / 2; const ghostRenderY = ghost.y * GRID_SIZE + GRID_SIZE / 2;
        
        ctx.fillStyle = ghost.isFrightened ? FRIGHTENED_COLOR : ghost.color; 
        ctx.beginPath();
        ctx.arc(ghostRenderX, ghostRenderY, ghost.radius, Math.PI, 0, false); 
        ctx.lineTo(ghostRenderX + ghost.radius, ghostRenderY + ghost.radius * 0.85);
        ctx.lineTo(ghostRenderX, ghostRenderY + ghost.radius * 0.70); 
        ctx.lineTo(ghostRenderX - ghost.radius, ghostRenderY + ghost.radius * 0.85);
        ctx.closePath(); ctx.fill();
        
        ctx.fillStyle = 'white'; 
        const eyeRadiusBase = ghost.radius / 3;
        const eyeOffsetX = ghost.radius / 2.5; 
        const eyeOffsetY = -ghost.radius / 5;

        if (ghost.isFrightened) {
            // Simple scared eyes: larger white circles, no pupils or tiny centered pupils
            const scaredEyeRadius = eyeRadiusBase * 1.2;
            ctx.beginPath(); ctx.arc(ghostRenderX - eyeOffsetX, ghostRenderY + eyeOffsetY, scaredEyeRadius, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(ghostRenderX + eyeOffsetX, ghostRenderY + eyeOffsetY, scaredEyeRadius, 0, Math.PI * 2); ctx.fill();
            // Optional: tiny pupils for scared eyes
            ctx.fillStyle = 'black';
            const scaredPupilRadius = scaredEyeRadius / 3;
            ctx.beginPath();ctx.arc(ghostRenderX - eyeOffsetX, ghostRenderY + eyeOffsetY, scaredPupilRadius, 0, Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(ghostRenderX + eyeOffsetX, ghostRenderY + eyeOffsetY, scaredPupilRadius, 0, Math.PI*2);ctx.fill();
        } else {
            // Normal eyes
            ctx.beginPath(); ctx.arc(ghostRenderX - eyeOffsetX, ghostRenderY + eyeOffsetY, eyeRadiusBase, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(ghostRenderX + eyeOffsetX, ghostRenderY + eyeOffsetY, eyeRadiusBase, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'black'; 
            const pupilRadius = eyeRadiusBase / 2; let pupilLookDx = ghost.dx; let pupilLookDy = ghost.dy;
            if (pupilLookDx === 0 && pupilLookDy === 0) pupilLookDy = -1; 
            const pupilShiftMagnitude = pupilRadius * 0.7; 
            ctx.beginPath(); ctx.arc(ghostRenderX - eyeOffsetX + pupilLookDx * pupilShiftMagnitude, ghostRenderY + eyeOffsetY + pupilLookDy * pupilShiftMagnitude, pupilRadius, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(ghostRenderX + eyeOffsetX + pupilLookDx * pupilShiftMagnitude, ghostRenderY + eyeOffsetY + pupilLookDy * pupilShiftMagnitude, pupilRadius, 0, Math.PI * 2); ctx.fill();
        }
    });
}

init();
