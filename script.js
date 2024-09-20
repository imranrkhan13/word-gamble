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
const rulesPopup = document.getElementById('rulePopup'); // Updated class name
const gotItButton = document.getElementById('gotItButton');

let boardState = Array(7).fill().map(() => Array(7).fill(''));
let currentPlayer = 'Player 1';
let player1Score = 0;
let player2Score = 0;
let player1Words = [];
let player2Words = [];
let globalUsedWords = new Set();
let selectedCell = null;

function showPopup(popup) {
  popup.style.display = 'flex';
}

function hidePopup(popup) {
  popup.style.display = 'none';
}

// Show the rules popup when the page loads
window.addEventListener('load', () => {
  showPopup(rulesPopup);
  hidePopup(namePopup); // Ensure name popup is hidden initially
});

// When "Got It" is clicked, hide rules and show name popup
gotItButton.addEventListener('click', () => {
  hidePopup(rulesPopup);
  showPopup(namePopup);
});

// Modify the existing startGame function
function startGame() {
    const player1Name = player1NameInput.value.trim();
    const player2Name = player2NameInput.value.trim();

    if (!player1Name || !player2Name) {
        alert('Please enter names for both players.');
        return;
    }

    player1NameEl.textContent = player1Name;
    player2NameEl.textContent = player2Name;

    hidePopup(namePopup);
    createBoard();
}

startGameButton.addEventListener('click', startGame);

function getCurrentPlayerName() {
    return currentPlayer === 'Player 1' ? player1NameEl.textContent : player2NameEl.textContent;
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
}

async function validateWord(word) {
    // Check if the word is already used
    if (globalUsedWords.has(word)) {
        console.log(`Word "${word}" has already been used.`);
        return false;
    }

    // Check if the word length is valid (minimum 3 characters)
    if (word.length < 3) {
        console.log(`Word "${word}" is too short.`);
        return false;
    }

    // Check if the word is made up of repeated letters (e.g., "AAA", "BBBB")
    if (/^(.)\1+$/.test(word)) {
        console.log(`Word "${word}" is made up of repeated letters.`);
        return false;
    }

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            // Check if the dictionary returns the exact word (case-insensitive match)
            return data[0] && data[0].word.toLowerCase() === word.toLowerCase();
        } else if (response.status === 404) {
            console.log(`Word "${word}" not found in the dictionary.`);
            return false;
        } else {
            console.error(`Unexpected response from dictionary API for word "${word}":`, response.status);
            return false;
        }
    } catch (error) {
        console.error('Error validating word:', word, error);
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
            cell.addEventListener('click', selectCell);
            
            const letterSpan = document.createElement('span');
            letterSpan.classList.add('letter');
            const cursorSpan = document.createElement('span');
            cursorSpan.classList.add('cursor');
            cursorSpan.textContent = '|';
            
            cell.appendChild(letterSpan);
            cell.appendChild(cursorSpan);
            
            board.appendChild(cell);
        }
    }
}

function selectCell(event) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
        selectedCell.querySelector('.cursor').style.display = 'none';
    }
    selectedCell = event.currentTarget;
    selectedCell.classList.add('selected');
    selectedCell.querySelector('.cursor').style.display = 'inline';

    // Focus on the hidden input field to trigger the mobile keyboard
    const hiddenInput = document.getElementById('hiddenInput');
    hiddenInput.focus();
}

function handleInput(event) {
    const key = event.target.value.toUpperCase();
    event.target.value = ''; // Clear the input for the next letter
    if (/^[A-Z]$/.test(key)) {
        updateSelectedCell(key);
    }
}

async function updateSelectedCell(key) {
    if (!selectedCell) return;

    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);

    if (selectedCell.querySelector('.letter').textContent === '') {
        boardState[row][col] = key;
        selectedCell.querySelector('.letter').textContent = key;
        await checkForWords(row, col, key);
        switchPlayer();

        if (allCellsFilled()) {
            checkWinCondition();
        }

        // Keep the hidden input focused for continuous typing
        const hiddenInput = document.getElementById('hiddenInput');
        hiddenInput.focus();  // Remove the blur statement

        // Remove selection from the current cell
        selectedCell.classList.remove('selected');
        selectedCell.querySelector('.cursor').style.display = 'none';
        selectedCell = null;
    }
}


function displayEndMessage(message) {
    const winnerMessage = document.getElementById('winnerMessage');
    const winnerNameElement = document.getElementById('winnerName');
    
    winnerNameElement.textContent = message;
    winnerMessage.classList.remove('hidden');
    winnerMessage.classList.add('visible');
}

function allCellsFilled() {
    return boardState.flat().every(cell => cell !== '');
}

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
    globalUsedWords.clear();
    createBoard();

    const winnerMessage = document.getElementById('winnerMessage');
    winnerMessage.classList.remove('visible');
    winnerMessage.classList.add('hidden');

    namePopup.style.display = 'flex';
}

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
            const r = parseInt(row) - i * direction.r;
            const c = parseInt(col) - i * direction.c;
            if (r >= 0 && r < 7 && c >= 0 && c < 7 && boardState[r][c] !== '') {
                leftPart = boardState[r][c] + leftPart;
            } else {
                break;
            }
        }

        // Check forward
        for (let i = 1; i < 7; i++) {
            const r = parseInt(row) + i * direction.r;
            const c = parseInt(col) + i * direction.c;
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

                // Validate the word
                if (await validateWord(subword)) {
                    newWords.push(subword);
                    globalUsedWords.add(subword);  // Mark the word as globally used
                    totalNewLetters += subword.length;
                }
            }
        }
    }

    // Update score and words list
    if (newWords.length > 0) {
        if (currentPlayer === 'Player 1') {
            player1Score += totalNewLetters;
            player1Words = [...new Set([...player1Words, ...newWords])];
            updateWordsDisplay(player1WordsEl, player1Words);
            player1ScoreEl.textContent = player1Score;
        } else {
            player2Score += totalNewLetters;
            player2Words = [...new Set([...player2Words, ...newWords])];
            updateWordsDisplay(player2WordsEl, player2Words);
            player2ScoreEl.textContent = player2Score;
        }
    }
}

function updateWordsDisplay(wordsElement, wordsArray) {
    wordsElement.innerHTML = wordsArray.map((word, index) => 
        `<span>${index + 1}. <a href="https://www.urbandictionary.com/define.php?term=${encodeURIComponent(word)}" 
            target="_blank" rel="noopener noreferrer">${word}</a></span>`
    ).join('<br>');
}

resetButton.addEventListener('click', resetGame);
document.getElementById('hiddenInput').addEventListener('input', handleInput);

// namePopup.style.display = 'flex';
