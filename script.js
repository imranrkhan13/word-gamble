const board = document.getElementById('board');
const player1ScoreEl = document.getElementById('player1Score');
const player2ScoreEl = document.getElementById('player2Score');
const resetButton = document.getElementById('reset');

const player1NameEl = document.getElementById('player1Name');
const player2NameEl = document.getElementById('player2Name');
const player1WordsEl = document.getElementById('player1Words');
const player2WordsEl = document.getElementById('player2Words');

const namePopup = document.getElementById('namePopup');
const player1NameInput = document.getElementById('player1NameInput');
const player2NameInput = document.getElementById('player2NameInput');
const startGameButton = document.getElementById('startGame');

let boardState = Array(7).fill().map(() => Array(7).fill(''));
let currentPlayer = 'Player 1';
let player1Score = 0;
let player2Score = 0;
let player1Words = [];
let player2Words = [];

// Function to start the game after names are entered
function startGame() {
    const player1Name = player1NameInput.value.trim() || 'Player 1';
    const player2Name = player2NameInput.value.trim() || 'Player 2';

    player1NameEl.textContent = player1Name;
    player2NameEl.textContent = player2Name;

    namePopup.style.display = 'none';
    createBoard();
}

// Event listener for the start game button
startGameButton.addEventListener('click', startGame);

// Function to get the current player's name
function getCurrentPlayerName() {
    return currentPlayer === 'Player 1' ? player1NameEl.textContent : player2NameEl.textContent;
}

// Function to switch the current player
function switchPlayer() {
    currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
}

// Word validation function
async function validateWord(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data[0] && data[0].word === word.toLowerCase();
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error validating word:', error);
        return false;
    }
}

// Function to create the board
function createBoard() {
    board.innerHTML = '';
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }
}

// Function to handle a cell click
async function handleCellClick(event) {
    const cell = event.target;
    const row = cell.dataset.row;
    const col = cell.dataset.col;

    if (boardState[row][col] !== '') return;

    const letter = prompt('Enter a letter:').toUpperCase();
    if (letter && /^[A-Z]$/.test(letter)) {
        boardState[row][col] = letter;
        cell.textContent = letter;
        await checkForWords(row, col, letter);
        switchPlayer();

        // Check for game end condition only after making a move
        if (allCellsFilled()) {
            checkWinCondition();
        }
    }
}

// Function to display the winning or draw message
function displayEndMessage(message) {
    const winnerMessage = document.getElementById('winnerMessage');
    const winnerNameElement = document.getElementById('winnerName');
    
    winnerNameElement.textContent = message;
    winnerMessage.classList.remove('hidden');
    
    setTimeout(() => {
        winnerMessage.classList.add('hidden');
    }, 3000); // Message stays for 3 seconds before hiding
}

// Function to check if all cells are filled
function allCellsFilled() {
    return boardState.flat().every(cell => cell !== '');
}

// Function to check win condition
function checkWinCondition() {
    if (allCellsFilled()) {
        let message;
        const player1Name = player1NameEl.textContent;
        const player2Name = player2NameEl.textContent;

        if (player1Score > player2Score) {
            message = `${player1Name} has won the game!`;
        } else if (player2Score > player1Score) {
            message = `${player2Name} has won the game!`;
        } else {
            message = `It's a draw between ${player1Name} and ${player2Name}!`;
        }
        displayEndMessage(message);
    }
}

// Function to reset the game
function resetGame() {
    boardState = Array(7).fill().map(() => Array(7).fill(''));
    currentPlayer = 'Player 1';
    player1Score = 0;
    player2Score = 0;
    player1Words = [];
    player2Words = [];
    player1WordsEl.innerHTML = '';
    player2WordsEl.innerHTML = '';
    player1ScoreEl.textContent = player1Score;
    player2ScoreEl.textContent = player2Score;
    createBoard();

    const winnerMessage = document.getElementById('winnerMessage');
    winnerMessage.classList.add('hidden');

    // Show the name input popup again
    namePopup.style.display = 'flex';
}

// Function to check for valid words
async function checkForWords(row, col, letter) {
    const directions = [
        { r: 0, c: 1 }, // Horizontal
        { r: 1, c: 0 }, // Vertical
    ];

    let newWords = [];
    let totalNewLetters = 0;

    for (let direction of directions) {
        let word = letter;
        let leftPart = '';
        let rightPart = '';

        // Check backward
        for (let i = 1; i < 7; i++) {
            const r = row - i * direction.r;
            const c = col - i * direction.c;
            if (r >= 0 && r < 7 && c >= 0 && c < 7 && boardState[r][c] !== '') {
                leftPart = boardState[r][c] + leftPart;
            } else {
                break;
            }
        }

        // Check forward
        for (let i = 1; i < 7; i++) {
            const r = row + i * direction.r;
            const c = col + i * direction.c;
            if (r >= 0 && r < 7 && c >= 0 && c < 7 && boardState[r][c] !== '') {
                rightPart += boardState[r][c];
            } else {
                break;
            }
        }

        word = leftPart + word + rightPart;

        // Check all possible subwords of length 3 or more
        for (let i = 0; i < word.length - 2; i++) {
            for (let j = i + 3; j <= word.length; j++) {
                const subword = word.slice(i, j);
                if (await validateWord(subword) && !newWords.includes(subword)) {
                    if (currentPlayer === 'Player 1' && !player1Words.includes(subword)) {
                        newWords.push(subword);
                        totalNewLetters += subword.length;
                    } else if (currentPlayer === 'Player 2' && !player2Words.includes(subword)) {
                        newWords.push(subword);
                        totalNewLetters += subword.length;
                    }
                }
            }
        }
    }

    // Update score and words list
    if (newWords.length > 0) {
        if (currentPlayer === 'Player 1') {
            player1Score += totalNewLetters;
            player1Words = [...new Set([...player1Words, ...newWords])];
            player1WordsEl.innerHTML = player1Words.join(', ');
            player1ScoreEl.textContent = player1Score;
        } else {
            player2Score += totalNewLetters;
            player2Words = [...new Set([...player2Words, ...newWords])];
            player2WordsEl.innerHTML = player2Words.join(', ');
            player2ScoreEl.textContent = player2Score;
        }
    }

    console.log(`${currentPlayer} formed new words: ${newWords.join(', ')}`);
    console.log(`${currentPlayer} scored ${totalNewLetters} points this turn`);
}

// Word validation function
async function validateWord(word) {
    console.log(`Validating word: ${word}`);
    
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const isValid = data[0] && data[0].word.toLowerCase() === word.toLowerCase();
            console.log(`Word ${word} is ${isValid ? 'valid' : 'invalid'}`);
            return isValid;
        } else {
            console.log(`Word ${word} is invalid (API returned not ok)`);
            return false;
        }
    } catch (error) {
        console.error('Error validating word:', error);
        return false;
    }
}

// Event listener for reset button
resetButton.addEventListener('click', resetGame);

// Initialize the game
namePopup.style.display = 'flex';
