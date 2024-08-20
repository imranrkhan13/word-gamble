const board = document.getElementById('board');
const player1ScoreEl = document.getElementById('player1Score');
const player2ScoreEl = document.getElementById('player2Score');
const resetButton = document.getElementById('reset');

let boardState = Array(7).fill().map(() => Array(7).fill(''));
let currentPlayer = 'Player 1';
let player1Score = 0;
let player2Score = 0;

async function validateWord(word) {
    // Simulated word validation using Oxford Dictionary API
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
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
}

async function checkForWords(row, col, letter) {
    const directions = [
        { r: 0, c: 1 }, // Horizontal
        { r: 1, c: 0 }, // Vertical
    ];

    for (let direction of directions) {
        let word = '';

        // Check backward
        for (let i = 1; i <= 2; i++) {
            const r = row - i * direction.r;
            const c = col - i * direction.c;
            if (r >= 0 && r < 7 && c >= 0 && c < 7) {
                word = boardState[r][c] + word;
            }
        }

        word += letter;

        // Check forward
        for (let i = 1; i <= 2; i++) {
            const r = row + i * direction.r;
            const c = col + i * direction.c;
            if (r >= 0 && r < 7 && c >= 0 && c < 7) {
                word += boardState[r][c];
            }
        }

        if (word.length === 3 && await validateWord(word)) {
            if (currentPlayer === 'Player 1') {
                player1Score++;
                player1ScoreEl.textContent = player1Score;
            } else {
                player2Score++;
                player2ScoreEl.textContent = player2Score;
            }
        }
    }
}

function resetGame() {
    boardState = Array(7).fill().map(() => Array(7).fill(''));
    currentPlayer = 'Player 1';
    player1Score = 0;
    player2Score = 0;
    player1ScoreEl.textContent = player1Score;
    player2ScoreEl.textContent = player2Score;
    createBoard();
}

resetButton.addEventListener('click', resetGame);

createBoard();
