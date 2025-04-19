const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let playerHands = [[]];
let currentHandIndex = 0;
let dealerHand = [];
let playerMoney = 1000;
let currentBet = 0;
let gameState = 'betting';

const dealerScoreElement = document.getElementById('dealer-score');
const playerHandsElement = document.getElementById('player-hands');
const messageElement = document.getElementById('message');
const playerMoneyElement = document.getElementById('player-money');
const currentBetElement = document.getElementById('current-bet');
const betAmountInput = document.getElementById('bet-amount');
const betButton = document.getElementById('bet-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const doubleButton = document.getElementById('double-button');
const splitButton = document.getElementById('split-button');
const newGameButton = document.getElementById('new-game-button');
const instructionsButton = document.getElementById('instructions-button');
const instructionsModal = document.getElementById('instructions');
const closeInstructionsButton = document.getElementById('close-instructions');

function createDeck() {
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            let value;
            if (rank === 'A') {
                value = 11;
            } else if (['K', 'Q', 'J'].includes(rank)) {
                value = 10;
            } else {
                value = parseInt(rank);
            }
            deck.push({ suit, rank, value });
        }
    }
    return shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    for (const card of hand) {
        if (card.rank === 'A') {
            aces += 1;
        }
        score += card.value;
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    return score;
}

function isBlackjack(hand) {
    return hand.length === 2 && calculateScore(hand) === 21;
}

function startNewGame() {
    deck = createDeck();
    playerHands = [[]];
    currentHandIndex = 0;
    dealerHand = [];
    gameState = 'betting';
    updateUI();
}

function dealInitialCards() {
    if (currentBet <= 0 || currentBet > playerMoney) {
        setMessage('Por favor, haz una apuesta válida.');
        return;
    }

    playerHands[0] = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];

    if (isBlackjack(playerHands[0])) {
        gameState = 'gameOver';
        playerMoney += currentBet * 1.5;
        setMessage('¡Black Jack! Has ganado 1.5 veces tu apuesta.');
    } else if (isBlackjack(dealerHand)) {
        gameState = 'gameOver';
        playerMoney -= currentBet;
        setMessage('La casa tiene Black Jack. Has perdido tu apuesta.');
    } else {
        gameState = 'playing';
        setMessage('Tu turno');
    }

    updateUI();
}

function hit() {
    playerHands[currentHandIndex].push(deck.pop());
    const score = calculateScore(playerHands[currentHandIndex]);

    if (score > 21) {
        if (currentHandIndex < playerHands.length - 1) {
            currentHandIndex++;
            setMessage(`Mano ${currentHandIndex} se pasó. Siguiente mano.`);
        } else {
            gameState = 'gameOver';
            playerMoney -= currentBet * playerHands.length;
            setMessage('¡Te has pasado! La casa gana.');
        }
    } else if (score === 21) {
        stand();
    }

    updateUI();
}

function stand() {
    if (currentHandIndex < playerHands.length - 1) {
        currentHandIndex++;
        setMessage(`Plantado en mano ${currentHandIndex}. Siguiente mano.`);
    } else {
        gameState = 'dealerTurn';
        dealerPlay();
    }
    updateUI();
}

function dealerPlay() {
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }

    const dealerScore = calculateScore(dealerHand);
    let totalWinnings = 0;

    playerHands.forEach((hand, index) => {
        const playerScore = calculateScore(hand);
        if (playerScore <= 21) {
            if (dealerScore > 21 || playerScore > dealerScore) {
                totalWinnings += currentBet;
                playerHands[index].result = 'win';
            } else if (dealerScore > playerScore) {
                totalWinnings -= currentBet;
                playerHands[index].result = 'lose';
            } else {
                playerHands[index].result = 'push';
            }
        } else {
            totalWinnings -= currentBet;
            playerHands[index].result = 'lose';
        }
    });

    playerMoney += totalWinnings;
    
    const wins = playerHands.filter(hand => hand.result === 'win').length;
    const losses = playerHands.filter(hand => hand.result === 'lose').length;
    const pushes = playerHands.filter(hand => hand.result === 'push').length;
    
    
let resultMessage = '';
if (wins > 0) resultMessage += `${wins} mano${wins > 1 ? 's' : ''} ganada${wins > 1 ? 's' : ''}. `;
if (losses > 0) resultMessage += `${losses} mano${losses > 1 ? 's' : ''} perdida${losses > 1 ? 's' : ''}. `;
if (pushes > 0) resultMessage += `${pushes} empate${pushes > 1 ? 's' : ''}. `;

setMessage(resultMessage.trim());
gameState = 'gameOver';

if (playerMoney <= 0) {
    setMessage('¡Game Over! Te has quedado sin dinero.');
}

updateUI();
}

function doubleDown() {
    if (playerHands[currentHandIndex].length !== 2 || playerMoney < currentBet * 2) {
        return;
    }

    currentBet *= 2;
    hit();
    if (gameState !== 'gameOver') {
        stand();
    }
}

function canSplit(hand) {
    return hand.length === 2 && (hand[0].value === hand[1].value || (hand[0].value >= 10 && hand[1].value >= 10));
}

function split() {
    const currentHand = playerHands[currentHandIndex];
    if (!canSplit(currentHand) || playerMoney < currentBet * 2) {
        return;
    }

    const newHand = [currentHand.pop()];
    playerHands.splice(currentHandIndex + 1, 0, newHand);
    
    playerHands[currentHandIndex].push(deck.pop());
    playerHands[currentHandIndex + 1].push(deck.pop());
    
    playerMoney -= currentBet;
    setMessage(`Mano dividida. Jugando Mano ${currentHandIndex + 1}`);
    
    updateUI();
}

function updateUI() {
    // Update dealer's hand
    const dealerCardsElement = document.querySelector('#dealer-hand .cards');
    dealerCardsElement.innerHTML = '';
    dealerHand.forEach((card, index) => {
        const cardElement = createCardElement(card, index === 0 && gameState !== 'gameOver');
        dealerCardsElement.appendChild(cardElement);
    });
    dealerScoreElement.textContent = gameState === 'gameOver' ? calculateScore(dealerHand) : '?';

    // Update player's hands
    playerHandsElement.innerHTML = '';
    playerHands.forEach((hand, index) => {
        const handElement = document.createElement('div');
        handElement.className = `player-hand ${index === currentHandIndex && gameState === 'playing' ? 'active-hand' : ''} ${hand.result || ''}`;
        
        const handTitle = document.createElement('h2');
        handTitle.textContent = `Jugador - Mano ${index + 1}`;
        handElement.appendChild(handTitle);

        const cardsElement = document.createElement('div');
        cardsElement.className = 'cards';
        hand.forEach(card => {
            const cardElement = createCardElement(card);
            cardsElement.appendChild(cardElement);
        });
        handElement.appendChild(cardsElement);

        const scoreElement = document.createElement('p');
        scoreElement.textContent = `Puntuación: ${calculateScore(hand)}`;
        handElement.appendChild(scoreElement);

        playerHandsElement.appendChild(handElement);
    });

    // Update message, money, and bet
    messageElement.textContent = messageElement.textContent;
    playerMoneyElement.textContent = playerMoney;
    currentBetElement.textContent = currentBet;

    // Update button visibility
    betButton.style.display = gameState === 'betting' ? 'inline-block' : 'none';
    hitButton.style.display = gameState === 'playing' ? 'inline-block' : 'none';
    standButton.style.display = gameState === 'playing' ? 'inline-block' : 'none';
    doubleButton.style.display = gameState === 'playing' && playerHands[currentHandIndex].length === 2 && playerMoney >= currentBet * 2 ? 'inline-block' : 'none';
    splitButton.style.display = gameState === 'playing' && canSplit(playerHands[currentHandIndex]) && playerMoney >= currentBet * 2 ? 'inline-block' : 'none';
    betAmountInput.style.display = gameState === 'betting' ? 'inline-block' : 'none';
}

function createCardElement(card, hidden = false) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${hidden ? 'hidden' : ''} ${card.suit === '♥' || card.suit === '♦' ? 'red' : ''}`;
    cardElement.textContent = hidden ? '?' : `${card.rank}${card.suit}`;
    return cardElement;
}

function setMessage(msg) {
    messageElement.textContent = msg;
}

// Event Listeners
betButton.addEventListener('click', () => {
    currentBet = parseInt(betAmountInput.value);
    dealInitialCards();
});

hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);
doubleButton.addEventListener('click', doubleDown);
splitButton.addEventListener('click', split);
newGameButton.addEventListener('click', startNewGame);

instructionsButton.addEventListener('click', () => {
    instructionsModal.style.display = 'block';
});

closeInstructionsButton.addEventListener('click', () => {
    instructionsModal.style.display = 'none';
});

// Initialize the game
startNewGame();