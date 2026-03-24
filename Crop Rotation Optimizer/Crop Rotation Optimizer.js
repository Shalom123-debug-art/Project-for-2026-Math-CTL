document.addEventListener('DOMContentLoaded', function() {
  
  // Mapping numbers to Crop Icons
  const CROP_MAP = {
    1: 'fas fa-seedling',   // Wheat proxy
    2: 'fas fa-carrot',     // Carrot
    3: 'fas fa-apple-alt',  // Apple
    4: 'fas fa-lemon',      // Lemon
    5: 'fas fa-pepper-hot', // Chili
    6: 'fas fa-leaf',       // Lettuce
    7: 'fas fa-wheat-awn',  // Corn
    8: 'fas fa-tree',       // Olive
    9: 'fas fa-clover'      // Clover
  };

  function solveSudoku(board) {
    const emptyCell = findCellWithFewestPossibilities(board);
    if (!emptyCell) return true;
    const [row, col] = emptyCell;
    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(board, row, col, num)) {
        board[row][col] = num;
        if (solveSudoku(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  function findCellWithFewestPossibilities(board) {
    let minOptions = 10;
    let bestCell = null;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          let options = 0;
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(board, i, j, num)) {
              options++;
            }
          }
          if (options < minOptions) {
            minOptions = options;
            bestCell = [i, j];
            if (minOptions === 1) return bestCell; 
          }
        }
      }
    }
    return bestCell;
  }

  function isValidPlacement(board, row, col, num) {
    for (let i = 0; i < 9; i++) if (board[i][col] === num) return false;
    for (let j = 0; j < 9; j++) if (board[row][j] === num) return false;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  }

  function isSolvable(board) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== 0) {
          const num = board[i][j];
          board[i][j] = 0;
          if (!isValidPlacement(board, i, j, num)) {
            board[i][j] = num;
            return false;
          }
          board[i][j] = num;
        } 
      }
    }
    const boardCopy = JSON.parse(JSON.stringify(board));
    return solveSudoku(boardCopy);
  }

  const solverBoard = document.getElementById("solver-board");
  const solverMessage = document.getElementById("solver-message");
  const solverNumpad = document.getElementById("solver-numpad");
  const verifyBtn = document.getElementById("verify");
  const solveSolverBtn = document.getElementById("solve-solver");
  const resetSolverBtn = document.getElementById("reset-solver");

  let solverSelectedCell = null;
  let isSolverSolved = false;
  let solverUserInput = Array(9).fill().map(() => Array(9).fill(false));

  function initializeSolverBoard() {
    solverBoard.innerHTML = "";
    for (let i = 0; i < 81; i++) {
      const cell = document.createElement('div');
      cell.classList.add("cell");
      cell.dataset.index = i;
      if ((i % 9) % 3 === 2 && (i % 9) < 8) cell.classList.add("border-right-3");
      if ((Math.floor(i / 9) % 3 === 2) && (Math.floor(i / 9) < 8)) cell.classList.add("border-bottom-3");
      cell.addEventListener('click', () => selectSolverCell(cell));
      solverBoard.appendChild(cell);
    }
    // Set icons on the side buttons
    const numBtns = solverNumpad.querySelectorAll('.numpad-btn');
    numBtns.forEach(btn => {
        const val = parseInt(btn.dataset.value);
        if(val > 0) btn.innerHTML = `<i class="${CROP_MAP[val]}"></i>`;
    });
  }

  function selectSolverCell(cell) {
    if (solverSelectedCell) solverSelectedCell.classList.remove("selected");
    solverSelectedCell = cell;
    cell.classList.add("selected");
  }

  function displaySolverBoard(boardData, isSolution = false) {
    const cells = solverBoard.querySelectorAll(".cell");
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const index = i * 9 + j;
        const value = boardData[i][j];
        if (value !== 0) {
          cells[index].innerHTML = `<i class="${CROP_MAP[value]}"></i>`;
          cells[index].dataset.value = value;
          if (isSolution) {
            cells[index].classList.add(solverUserInput[i][j] ? "solver-user-input" : "solver-solution");
          } else {
            solverUserInput[i][j] = true;
            cells[index].classList.add("solver-user-input");
          }
        } else {
          cells[index].innerHTML = "";
          cells[index].dataset.value = 0;
          cells[index].classList.remove("solver-user-input", "solver-solution");
        }
      }
    }
  }

  function getSolverBoard() {
    const cells = solverBoard.querySelectorAll(".cell");
    const board = Array(9).fill().map(() => Array(9).fill(0));
    cells.forEach(cell => {
      const idx = parseInt(cell.dataset.index);
      board[Math.floor(idx/9)][idx%9] = cell.dataset.value ? parseInt(cell.dataset.value) : 0;
    });
    return board;
  }

  function showSolverMessage(text, type) {
    solverMessage.textContent = text;
    solverMessage.className = "message " + type;
  }

  verifyBtn.addEventListener('click', () => {
    const board = getSolverBoard();
    if (isSolvable(board)) showSolverMessage("Rotation is valid!", "success");
    else showSolverMessage("Rotation violates biodiversity rules.", "error");
  });

  solveSolverBtn.addEventListener('click', () => {
    const board = getSolverBoard();
    if (isSolvable(board)) {
      solveSudoku(board);
      displaySolverBoard(board, true);
      isSolverSolved = true;
      showSolverMessage("Field Optimized!", "success");
    } else {
      showSolverMessage("Cannot solve this layout.", "error");
    }
  });

  resetSolverBtn.addEventListener('click', () => {
    initializeSolverBoard();
    isSolverSolved = false;
    solverUserInput = Array(9).fill().map(() => Array(9).fill(false));
    showSolverMessage("Field cleared.", "info");
  });

  solverNumpad.addEventListener('click', (e) => {
    const btn = e.target.closest('.numpad-btn');
    if (!isSolverSolved && solverSelectedCell && btn) {
      const value = parseInt(btn.dataset.value);
      const idx = parseInt(solverSelectedCell.dataset.index);
      if (value === 0) {
        solverSelectedCell.innerHTML = "";
        solverSelectedCell.dataset.value = 0;
        solverUserInput[Math.floor(idx/9)][idx%9] = false;
      } else {
        solverSelectedCell.innerHTML = `<i class="${CROP_MAP[value]}"></i>`;
        solverSelectedCell.dataset.value = value;
        solverUserInput[Math.floor(idx/9)][idx%9] = true;
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (isSolverSolved || !solverSelectedCell) return;
    if (event.key >= "1" && event.key <= "9") {
      const value = parseInt(event.key);
      const idx = parseInt(solverSelectedCell.dataset.index);
      solverSelectedCell.innerHTML = `<i class="${CROP_MAP[value]}"></i>`;
      solverSelectedCell.dataset.value = value;
      solverUserInput[Math.floor(idx/9)][idx%9] = true;
    } else if (["0", "Backspace", "Delete"].includes(event.key)) {
      solverSelectedCell.innerHTML = "";
      solverSelectedCell.dataset.value = 0;
      const idx = parseInt(solverSelectedCell.dataset.index);
      solverUserInput[Math.floor(idx/9)][idx%9] = false;
    }
  });

  initializeSolverBoard();
});
