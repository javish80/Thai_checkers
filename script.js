const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const mangaOverlay = document.getElementById('manga-overlay');
const mangaText = document.getElementById('manga-text');
const modeSelect = document.getElementById('mode-select');
const restartBtn = document.getElementById('restart-btn');

let boardState = []; // 8x8 array
let currentPlayer = 'red'; // 'red' or 'cyan'
let selectedCell = null; // {r, c}
let validMoves = []; // Array of {r, c}
let gameMode = 'pvp'; // 'pvp' or 'pvc'

function initBoard() {
    currentPlayer = 'red';
    selectedCell = null;
    validMoves = [];
    statusElement.textContent = "Red's Turn";
    statusElement.style.color = "white";
    boardElement.style.pointerEvents = 'auto';
    gameMode = modeSelect.value;
    boardState = Array(8).fill(null).map(() => Array(8).fill(null));
    boardElement.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => handleCellClick(r, c));

            // Populate initial pieces
            if (r === 0) {
                boardState[r][c] = 'cyan';
                const piece = document.createElement('div');
                piece.classList.add('piece', 'cyan');
                cell.appendChild(piece);
            } else if (r === 7) {
                boardState[r][c] = 'red';
                const piece = document.createElement('div');
                piece.classList.add('piece', 'red');
                cell.appendChild(piece);
            }

            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(r, c) {
    // Prevent human interaction if it's the computer's turn
    if (gameMode === 'pvc' && currentPlayer === 'cyan') return;

    // If clicked on own piece, select it
    if (boardState[r][c] === currentPlayer) {
        selectedCell = {r, c};
        updateBoardUI();
        return;
    }

    // If selected, check if valid move
    if (selectedCell) {
        const isValid = validMoves.some(m => m.r === r && m.c === c);
        if (isValid) {
            movePiece(selectedCell.r, selectedCell.c, r, c);
        } else {
            // Deselect if invalid move
            selectedCell = null;
            updateBoardUI();
        }
    }
}

function updateBoardUI() {
    // Clear previous selections and valid moves
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('selected', 'valid-move');
    });

    validMoves = [];

    if (selectedCell) {
        const {r, c} = selectedCell;
        const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (cellEl) cellEl.classList.add('selected');

        validMoves = getValidMoves(r, c);
        validMoves.forEach(m => {
            const moveCellEl = document.querySelector(`.cell[data-r="${m.r}"][data-c="${m.c}"]`);
            if (moveCellEl) moveCellEl.classList.add('valid-move');
        });
    }
}

function getValidMoves(r, c) {
    const moves = [];
    const directions = [
        {dr: -1, dc: 0}, // up
        {dr: 1, dc: 0},  // down
        {dr: 0, dc: -1}, // left
        {dr: 0, dc: 1}   // right
    ];

    for (const {dr, dc} of directions) {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (boardState[nr][nc] === null) {
                moves.push({r: nr, c: nc});
            } else {
                break; // Blocked by a piece
            }
            nr += dr;
            nc += dc;
        }
    }
    return moves;
}

function movePiece(fromR, fromC, toR, toC) {
    // Update state
    boardState[toR][toC] = boardState[fromR][fromC];
    boardState[fromR][fromC] = null;

    // Update DOM
    const fromCell = document.querySelector(`.cell[data-r="${fromR}"][data-c="${fromC}"]`);
    const toCell = document.querySelector(`.cell[data-r="${toR}"][data-c="${toC}"]`);
    const piece = fromCell.querySelector('.piece');

    toCell.appendChild(piece);
    selectedCell = null;
    updateBoardUI();

    processCaptures(toR, toC, currentPlayer);

    // Switch turn
    currentPlayer = currentPlayer === 'red' ? 'cyan' : 'red';
    statusElement.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;

    if (!checkWinCondition() && gameMode === 'pvc' && currentPlayer === 'cyan') {
        setTimeout(makeComputerMove, 1000); // 1 sec delay for realism
    }
}

function makeComputerMove() {
    if (checkWinCondition()) return; // Don't move if game is over

    let allMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] === 'cyan') {
                const moves = getValidMoves(r, c);
                moves.forEach(m => {
                    // Simulate move to get captures
                    let simulatedBoard = boardState.map(row => [...row]);
                    simulatedBoard[m.r][m.c] = simulatedBoard[r][c];
                    simulatedBoard[r][c] = null;
                    const captures = getCaptures(simulatedBoard, m.r, m.c, 'cyan');

                    allMoves.push({
                        fromR: r, fromC: c,
                        toR: m.r, toC: m.c,
                        captures: captures.length
                    });
                });
            }
        }
    }

    if (allMoves.length > 0) {
        // Sort to find the move that captures the most pieces
        allMoves.sort((a, b) => b.captures - a.captures);

        // Filter to keep only the best moves (in case of tie)
        const bestCaptures = allMoves[0].captures;
        const bestMoves = allMoves.filter(m => m.captures === bestCaptures);

        // Pick a random move among the best
        const chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

        movePiece(chosenMove.fromR, chosenMove.fromC, chosenMove.toR, chosenMove.toC);
    }
}

function getCaptures(board, r, c, player) {
    let captured = [];

    // 1. Intervention Capture: piece moved between opponent pieces.
    // Check horizontal
    let leftCount = 0;
    for (let nc = c - 1; nc >= 0; nc--) {
        if (board[r][nc] && board[r][nc] !== player) leftCount++;
        else break;
    }
    let rightCount = 0;
    for (let nc = c + 1; nc < 8; nc++) {
        if (board[r][nc] && board[r][nc] !== player) rightCount++;
        else break;
    }
    if (leftCount > 0 && rightCount > 0) {
        for (let nc = c - leftCount; nc <= c + rightCount; nc++) {
            if (nc !== c) captured.push({r, c: nc});
        }
    }

    // Check vertical
    let upCount = 0;
    for (let nr = r - 1; nr >= 0; nr--) {
        if (board[nr][c] && board[nr][c] !== player) upCount++;
        else break;
    }
    let downCount = 0;
    for (let nr = r + 1; nr < 8; nr++) {
        if (board[nr][c] && board[nr][c] !== player) downCount++;
        else break;
    }
    if (upCount > 0 && downCount > 0) {
        for (let nr = r - upCount; nr <= r + downCount; nr++) {
            if (nr !== r) captured.push({r: nr, c});
        }
    }

    // 2. Custodian Capture: piece moved to trap opponent pieces.
    const directions = [
        {dr: -1, dc: 0}, {dr: 1, dc: 0}, {dr: 0, dc: -1}, {dr: 0, dc: 1}
    ];

    for (const {dr, dc} of directions) {
        let nr = r + dr;
        let nc = c + dc;
        let trapped = [];

        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (board[nr][nc] && board[nr][nc] !== player) {
                trapped.push({r: nr, c: nc});
            } else if (board[nr][nc] === player) {
                if (trapped.length > 0) {
                    captured = captured.concat(trapped);
                }
                break;
            } else {
                break;
            }
            nr += dr;
            nc += dc;
        }
    }

    // Remove duplicates
    return captured.filter((v, i, a) => a.findIndex(t => (t.r === v.r && t.c === v.c)) === i);
}

function processCaptures(r, c, player) {
    const captured = getCaptures(boardState, r, c, player);

    if (captured.length > 0) {
        triggerMangaAnimation();
        captured.forEach(pos => {
            boardState[pos.r][pos.c] = null;
            const cell = document.querySelector(`.cell[data-r="${pos.r}"][data-c="${pos.c}"]`);
            const p = cell.querySelector('.piece');
            if (p) {
                p.classList.add('captured-anim');
                setTimeout(() => {
                    if (cell.contains(p)) {
                        cell.removeChild(p);
                    }
                }, 500); // Wait for animation
            }
        });
    }
}

function triggerMangaAnimation() {
    // Trigger screen shake
    document.body.classList.add('shake');

    // Show manga overlay and text
    mangaOverlay.classList.remove('hidden');

    // Randomize text and color
    const texts = ["BAM!", "SLASH!", "CRASH!", "BOOM!"];
    const colors = ["red", "orange", "yellow", "cyan"];
    mangaText.textContent = texts[Math.floor(Math.random() * texts.length)];
    mangaText.style.textShadow = `
        -4px -4px 0 #000,
        4px -4px 0 #000,
        -4px 4px 0 #000,
        4px 4px 0 #000,
        10px 10px 0px ${colors[Math.floor(Math.random() * colors.length)]}
    `;

    // Re-trigger animation
    mangaText.style.animation = 'none';
    mangaText.offsetHeight; // Trigger reflow
    mangaText.style.animation = null;

    setTimeout(() => {
        document.body.classList.remove('shake');
        mangaOverlay.classList.add('hidden');
    }, 1000);
}

function checkWinCondition() {
    let redCount = 0;
    let cyanCount = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] === 'red') redCount++;
            if (boardState[r][c] === 'cyan') cyanCount++;
        }
    }

    if (redCount <= 1) {
        statusElement.textContent = "Cyan Wins!";
        statusElement.style.color = "cyan";
        boardElement.style.pointerEvents = 'none';
        return true;
    } else if (cyanCount <= 1) {
        statusElement.textContent = "Red Wins!";
        statusElement.style.color = "red";
        boardElement.style.pointerEvents = 'none';
        return true;
    }
    return false;
}

modeSelect.addEventListener('change', initBoard);
restartBtn.addEventListener('click', initBoard);

initBoard();
