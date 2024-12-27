let rows, cols, minesCount;
let board = [];
let revealedCount = 0;
let flaggedCount = 0;
let isGameOver = false;
let timer;
let seconds = 0;
let isFirstClick = true;

const difficultySettings = {
    easy: { rows: 8, cols: 8, minesCount: 10 },
    medium: { rows: 16, cols: 16, minesCount: 40 },
    hard: { rows: 16, cols: 30, minesCount: 99 }
};

function setDifficulty() {
    const difficulty = document.getElementById('difficulty-selector').value;
    ({ rows, cols, minesCount } = difficultySettings[difficulty]);
    resetGame();
}

function createBoard(firstClickRow, firstClickCol) {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Generate all possible cells
    const allCells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            allCells.push([r, c]);
        }
    }

    // Exclude the safe area around the first click
    const safeArea = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = firstClickRow + i;
            const newCol = firstClickCol + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                safeArea.push([newRow, newCol]);
            }
        }
    }

    // Filter safe cells from the list of all cells
    const validCells = allCells.filter(([r, c]) =>
        !safeArea.some(([sr, sc]) => sr === r && sc === c)
    );

    // Place mines in random cells from the filtered list
    for (let i = 0; i < minesCount; i++) {
        const randomIndex = Math.floor(Math.random() * validCells.length);
        const [row, col] = validCells.splice(randomIndex, 1)[0];
        board[row][col] = 'X';
        updateAdjacentCells(row, col);
    }
}

function updateAdjacentCells(row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol] !== 'X') {
                board[newRow][newCol]++;
            }
        }
    }
}

function createGameBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => revealCell(r, c));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(r, c);
            });
            gameBoard.appendChild(cell);
        }
    }
}

function revealCell(row, col) {
    if (isGameOver) return;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

    if (cell.classList.contains('questioned'))
        cell.classList.remove('questioned');

    if (isFirstClick) {
        isFirstClick = false;
        ensureSafeFirstClick(row, col);
        createBoard(row, col); // Make sure to pass the coordinates of the first click
        startTimer();
    }

    if (board[row][col] === 'X') {
        isGameOver = true;
        revealAllMines();
        showGameStatus('Game Over! 💣');
        stopTimer();
        return;
    }

    cell.classList.add('revealed');
    if (board[row][col] > 0) {
        cell.textContent = board[row][col];
        cell.dataset.value = board[row][col];
    }
    revealedCount++;

    if (board[row][col] === 0) {
        revealAdjacentCells(row, col);
    }

    if (revealedCount === rows * cols - minesCount) {
        isGameOver = true;
        showGameStatus('You Win! 🎉');
        stopTimer();
    }
}

function revealAdjacentCells(row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                revealCell(newRow, newCol);
            }
        }
    }
}

function toggleFlag(row, col) {
    if (isGameOver || isFirstClick) return;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell.classList.contains('revealed')) return;

    if (cell.classList.contains('flagged')) {
        // Change from flag to question mark
        cell.classList.remove('flagged');
        cell.classList.add('questioned');
        cell.innerHTML = '<i class="fas fa-question"></i>';
        flaggedCount--;
    } else if (cell.classList.contains('questioned')) {
        // Remove the question mark
        cell.classList.remove('questioned');
        cell.innerHTML = '';
    } else if (flaggedCount < minesCount) {
        // Add a flag
        cell.classList.add('flagged');
        cell.innerHTML = '<i class="fas fa-flag"></i>';
        flaggedCount++;
    }

    updateFlagsLeft();
}

function updateFlagsLeft() {
    document.getElementById('flags-count').textContent = minesCount - flaggedCount;
}

function revealAllMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === 'X') {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                cell.classList.add('revealed', 'mine');
                cell.innerHTML = '<i class="fas fa-bomb"></i>';
            }
        }
    }
}

function showGameStatus(message) {
    document.getElementById('game-status').textContent = message;
}

function resetGame() {
    isGameOver = false;
    revealedCount = 0;
    flaggedCount = 0;
    isFirstClick = true;
    seconds = 0;
    stopTimer();
    document.getElementById('time-count').textContent = '0s';
    document.getElementById('game-status').textContent = '';
    createBoard();
    createGameBoard();
    updateFlagsLeft();
}

function startTimer() {
    timer = setInterval(() => {
        seconds++;
        document.getElementById('time-count').textContent = `${seconds}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('#toggle-theme i');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
   }
}

function loadThemePreference() {
   const isDarkMode= localStorage.getItem('darkMode') === 'true';
   if(isDarkMode){
       document.body.classList.add('dark-mode');
   }
   updateThemeIcon();
}

function ensureSafeFirstClick(row, col) {
   // Ensure that the first click is not on a mine or a number
   if(board[row][col] === 'X' || board[row][col] !== 0){
       // Place the mines again while ensuring that the first click is safe
       resetBoard();
       createBoard();
       ensureSafeFirstClick(row,col);
   }
}

function resetBoard() {
   board= Array.from({length:rows},()=>Array(cols).fill(0));
}


document.getElementById('difficulty-selector').addEventListener('change', setDifficulty);
document.getElementById('reset-game').addEventListener('click', resetGame);
document.getElementById('toggle-theme').addEventListener('click', toggleTheme);

loadThemePreference();
setDifficulty(); // Initialize the game with the default difficulty
