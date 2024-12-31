class Game2048 {
    constructor() {
        this.grid = new Array(4).fill(null).map(() => new Array(4).fill(0));
        this.score = 0;
        this.bestScore = this.getCookie('bestScore') || 0;
        this.isGameOver = false;
        this.difficulty = this.getCookie('difficulty') || 'medium';
        this.nightMode = this.getCookie('nightMode') === 'true';

        this.tileContainer = document.querySelector('.tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.messageContainer = document.querySelector('.game-message');
        this.difficultySelect = document.getElementById('difficulty');
        this.nightModeToggle = document.getElementById('night-mode-toggle');

        this.setupEventListeners();
        this.initializeGame();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('new-game-button').addEventListener('click', () => this.newGame());
        this.difficultySelect.addEventListener('change', (e) => this.changeDifficulty(e.target.value));
        this.nightModeToggle.addEventListener('click', () => this.toggleNightMode());
        document.querySelector('.keep-playing-button').addEventListener('click', () => this.keepPlaying());
        document.querySelector('.retry-button').addEventListener('click', () => this.newGame());

        // Easter Egg: Konami Code
        let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.activateEasterEgg();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });

        // Soporte para dispositivos móviles
        let touchStartX, touchStartY, touchEndX, touchEndY;
        const gameContainer = document.querySelector('.game-container');
        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0]?.clientX || 0;
            touchStartY = e.touches[0]?.clientY || 0;
        });

        gameContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0]?.clientX || 0;
            touchEndY = e.changedTouches[0]?.clientY || 0;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        });
    }

    initializeGame() {
        this.addRandomTile();
        this.addRandomTile();
        this.updateGrid();
        this.updateScore();
        this.difficultySelect.value = this.difficulty;
        this.applyNightMode();
    }

    newGame() {
        this.grid = new Array(4).fill(null).map(() => new Array(4).fill(0));
        this.score = 0;
        this.isGameOver = false;
        this.messageContainer.style.display = 'none';
        this.tileContainer.innerHTML = '';
        this.initializeGame();
    }

    addRandomTile() {
        let emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateGrid() {
        this.tileContainer.innerHTML = '';
        const size = this.tileContainer.clientWidth;
        const tileSize = size / 4;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] !== 0) {
                    let tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    tile.style.top = `${i * 25 + 2}%`;
                    tile.style.left = `${j * 25 + 2}%`;
                    this.tileContainer.appendChild(tile);
                }
            }
        }
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreDisplay.textContent = this.bestScore;
            this.setCookie('bestScore', this.bestScore, 365);
        }
    }

    handleKeyPress(e) {
        if (this.isGameOver) return;

        let moved = false;
        switch(e.key) {
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.updateGrid();
            this.updateScore();
            this.checkGameOver();
        }
    }

    handleSwipe(startX, startY, endX, endY) {
        if (this.isGameOver) return;

        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 30;

        let moved = false;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > minSwipeDistance) {
                moved = this.moveRight();
            } else if (deltaX < -minSwipeDistance) {
                moved = this.moveLeft();
            }
        } else {
            if (deltaY > minSwipeDistance) {
                moved = this.moveDown();
            } else if (deltaY < -minSwipeDistance) {
                moved = this.moveUp();
            }
        }

        if (moved) {
            this.addRandomTile();
            this.updateGrid();
            this.updateScore();
            this.checkGameOver();
        }
    }

    moveUp() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            let tiles = [];
            for (let row = 0; row < 4; row++) {
                if (this.grid[row][col] !== 0) tiles.push(this.grid[row][col]);
            }
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] *= 2;
                    this.score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            while (tiles.length < 4) tiles.push(0);

            for (let row = 0; row < 4; row++) {
                if (this.grid[row][col] !== tiles[row]) {
                    moved = true;
                }
                this.grid[row][col] = tiles[row];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            let tiles = [];
            for (let row = 3; row >= 0; row--) {
                if (this.grid[row][col] !== 0) tiles.push(this.grid[row][col]);
            }
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] *= 2;
                    this.score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            while (tiles.length < 4) tiles.push(0);

            for (let row = 3; row >= 0; row--) {
                if (this.grid[row][col] !== tiles[3 - row]) {
                    moved = true;
                }
                this.grid[row][col] = tiles[3 - row];
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            let tiles = [];
            for (let col = 3; col >= 0; col--) {
                if (this.grid[row][col] !== 0) tiles.push(this.grid[row][col]);
            }
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] *= 2;
                    this.score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            while (tiles.length < 4) tiles.push(0);

            for (let col = 3; col >= 0; col--) {
                if (this.grid[row][col] !== tiles[3 - col]) {
                    moved = true;
                }
                this.grid[row][col] = tiles[3 - col];
            }
        }
        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            let tiles = [];
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] !== 0) tiles.push(this.grid[row][col]);
            }
            for (let i = 0; i < tiles.length - 1; i++) {
                if (tiles[i] === tiles[i + 1]) {
                    tiles[i] *= 2;
                    this.score += tiles[i];
                    tiles.splice(i + 1, 1);
                }
            }
            while (tiles.length < 4) tiles.push(0);

            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] !== tiles[col]) {
                    moved = true;
                }
                this.grid[row][col] = tiles[col];
            }
        }
        return moved;
    }

    move(callback) {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let originalRow = this.difficulty === 'hard' ? this.grid[i].slice().reverse() : this.grid[i].slice();
            let newRow = callback(originalRow);
            if (this.difficulty === 'hard') newRow.reverse();
            if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    checkGameOver() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return;
                if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return;
                if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return;
            }
        }
        this.isGameOver = true;
        this.messageContainer.style.display = 'block';
        this.messageContainer.querySelector('p').textContent = 'Game Over!';
    }

    changeDifficulty(newDifficulty) {
        this.difficulty = newDifficulty;
        this.setCookie('difficulty', newDifficulty, 365);
        this.newGame();
    }

    toggleNightMode() {
        this.nightMode = !this.nightMode;
        this.setCookie('nightMode', this.nightMode, 365);
        this.applyNightMode();
    }

    applyNightMode() {
        document.body.classList.toggle('night-mode', this.nightMode);
    }

    keepPlaying() {
        if (this.isGameOver) {
            this.isGameOver = false;
            this.messageContainer.style.display = 'none';
        }
    }

    activateEasterEgg() {
        alert('¡Has descubierto el Easter Egg! Todos los valores se multiplicarán por 2.');
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] !== 0) {
                    this.grid[i][j] *= 2;
                }
            }
        }
        this.updateGrid();
        this.updateScore();
    }

    setCookie(name, value, days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
}

// Iniciar el juego
new Game2048();


