const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let sudokuBoard = null;

const gridSize = 9; 
const cellSize = Math.min(window.innerWidth * 0.9, 450) / gridSize; // Tamaño dinámico

canvas.width = cellSize * gridSize;
canvas.height = cellSize * gridSize;

// Función para dibujar el tablero en el canvas
function drawGrid(board, modified) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    // Dibujar líneas más gruesas para separar las regiones 3x3
    ctx.lineWidth = 3;
    for (let i = 0; i <= gridSize; i += 3) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    // Dibujar los números del tablero
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] !== 0) {
                // Cambiar el color si es una celda ingresada por el usuario
                ctx.fillStyle = modified[row][col] ? "#5100ff" : "white"; 
                ctx.fillText(board[row][col], col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
            }
        }
    }
}

// Función para generar un tablero vacío
function generateEmptyBoard() {
    const board = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    const modified = Array.from({ length: gridSize }, () => Array(gridSize).fill(false)); // Para saber si fue modificado
    return {board, modified}
}

// Función para verificar si un número es válido en una posición
function isValid(board, row, col, num) {
    // Verificar fila y columna
    for (let i = 0; i < gridSize; i++) {
        if (board[row][i] === num && i !== col) return false;
        if (board[i][col] === num && i !== row) return false;
    }

    // Verificar la subcuadrícula 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let r = startRow + i, c = startCol + j;
            if (board[r][c] === num && (r !== row || c !== col)) return false;
        }
    }

    return true;
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Algoritmo de backtracking para llenar el tablero
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function solveBoard(board) {
    let numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Mezcla los números antes de usarlos

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === 0) {
                for (let num of numbers) { // Usa el orden aleatorio
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveBoard(board)) return true;
                        board[row][col] = 0; // Retroceder si no hay solución
                    }
                }
                return false; // No hay número válido en esta posición
            }
        }
    }
    return true; // Tablero resuelto
}


// Generar un Sudoku completo
function generateSudoku() {
    let board = generateEmptyBoard();
    solveBoard(board.board);
    return board;
}

// Función para eliminar números y hacer el juego jugable
function removeNumbers(sudokuBoard, numEmptyCells) {
    let attempts = numEmptyCells;
    while (attempts > 0) {
        let row = Math.floor(Math.random() * gridSize);
        let col = Math.floor(Math.random() * gridSize);
        while (sudokuBoard.board[row][col] === 0) {
            row = Math.floor(Math.random() * gridSize);
            col = Math.floor(Math.random() * gridSize);
        }
        sudokuBoard.board[row][col] = 0;
        attempts--;
    }
    return sudokuBoard;
}

let selectedCell = null;

// Detectar clic en el canvas
canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // Verificar si la celda ha sido modificada por el usuario
    if (sudokuBoard.board[row][col] === 0) {
        selectedCell = { row, col };
        showNumberSelection(event.clientX, event.clientY);
    } else {
        // Si la celda no fue modificada por el usuario, no permitir borrar
        if (sudokuBoard.modified[row][col] === false) {
            return;  // No hacer nada si no es una celda modificada
        } else {
            // Si la celda fue modificada por el usuario, permite borrarla
            sudokuBoard.board[row][col] = 0;
            sudokuBoard.modified[row][col] = false;  // Marcar como no modificada
            drawGrid(sudokuBoard.board, sudokuBoard.modified);
        }
    }
});

function showNumberSelection(x, y) {
     // Si ya existe un menú, lo eliminamos
    const existingMenu = document.querySelector(".number-menu");
    if (existingMenu) {
        document.body.removeChild(existingMenu);
    }

    // Crear un nuevo menú
    const menu = document.createElement("div");
    menu.classList.add("number-menu");
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    for (let i = 1; i <= 9; i++) {
        let numButton = document.createElement("button");
        numButton.textContent = i;
        numButton.onclick = function () {
            if (selectedCell) {
                // Actualiza el tablero con el número seleccionado
                sudokuBoard.board[selectedCell.row][selectedCell.col] = i;
                // Marca la celda como modificada
                sudokuBoard.modified[selectedCell.row][selectedCell.col] = true; // Marca la celda como modificada
                // Redibuja el tablero
                drawGrid(sudokuBoard.board, sudokuBoard.modified);
                document.body.removeChild(menu);
                selectedCell = null;

                // Verificar si el tablero está resuelto
                if (isBoardSolved(sudokuBoard.board)) {
                    showVictoryMessage();
                }
            }
        };
        menu.appendChild(numButton);
    }

    document.body.appendChild(menu);
}

// Capturar el botón de inicio
document.getElementById("startGame").addEventListener("click", function () {
    const difficulty = document.getElementById("difficulty").value;

    let numEmptyCells;
    if (difficulty === "easy") {
        numEmptyCells = 40;
    } else if (difficulty === "medium") {
        numEmptyCells = 50;
    } else if (difficulty === "hard") {
        numEmptyCells = 60;
    } else {
        numEmptyCells = 1;
    }

    // Generar Sudoku con la dificultad seleccionada
    sudokuBoard = generateSudoku();
    sudokuBoard = removeNumbers(sudokuBoard, numEmptyCells);
    drawGrid(sudokuBoard.board, sudokuBoard.modified);
});

// Función para verificar si el tablero está resuelto correctamente
function isBoardSolved(board) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === 0) return false; // Aún hay espacios vacíos
            if (!isValid(board, row, col, board[row][col])) return false; // No es una solución válida
        }
    }

    return true;
}

// Función para mostrar el mensaje de victoria
function showVictoryMessage() {
    const victoryMessage = document.createElement("div");
    victoryMessage.textContent = "¡Felicidades! Has resuelto el Sudoku.";
    victoryMessage.style.position = "absolute";
    victoryMessage.style.top = "50%";
    victoryMessage.style.left = "50%";
    victoryMessage.style.transform = "translate(-50%, -50%)";
    victoryMessage.style.backgroundColor = "#5100ff";
    victoryMessage.style.color = "white";
    victoryMessage.style.padding = "20px";
    victoryMessage.style.fontSize = "20px";
    victoryMessage.style.borderRadius = "10px";
    victoryMessage.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.3)";
    victoryMessage.style.zIndex = "1001";
    
    document.body.appendChild(victoryMessage);

    // El mensaje desaparece después de 3 segundos
    setTimeout(() => {
        document.body.removeChild(victoryMessage);
    }, 3000);
}