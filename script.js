const nameMenu = document.getElementById("nameMenu");
const boardMenu = document.getElementById("boardMenu");
const game = document.getElementById("game");
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const congratsScreen = document.getElementById("congratsScreen");
const congratsMessage = document.getElementById("congratsMessage");

let playerXName = "Player X";
let playerOName = "Player O";
let boardSize = 3;
let currentPlayer = "X";
let gameState = [];
let gameActive = true;
let xWins = 0;
let oWins = 0;

function goToBoardMenu() {
  playerXName = document.getElementById("playerX").value || "Player X";
  playerOName = document.getElementById("playerO").value || "Player O";
  nameMenu.classList.add("hidden");
  boardMenu.classList.remove("hidden");
}

function startGame(size) {
  boardSize = size;
  boardMenu.classList.add("hidden");
  game.classList.remove("hidden");
  createBoard();
}

function createBoard() {
  board.innerHTML = "";
  gameState = Array(boardSize * boardSize).fill("");
  gameActive = true;
  currentPlayer = "X";
  xWins = 0;
  oWins = 0;
  statusText.textContent = `${playerXName} (X) vs ${playerOName} (O)`;

  board.style.gridTemplateColumns = `repeat(${boardSize}, 80px)`;
  board.style.gridTemplateRows = `repeat(${boardSize}, 80px)`;

  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-index", i);
    cell.addEventListener("click", handleCellClick);
    board.appendChild(cell);
  }
}

function handleCellClick(e) {
  const index = e.target.getAttribute("data-index");
  if (gameState[index] !== "" || !gameActive) return;

  gameState[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer);

  // Check if this move creates new winning lines
  const winningCombos = findWinningLines();
  winningCombos.forEach(({combo, player}) => {
    drawWinningLine(combo, player);
    if (player === "X") xWins++;
    if (player === "O") oWins++;
  });

  // If board full -> finalize
  if (!gameState.includes("")) {
    finalizeGame();
    return;
  }

  // Switch player
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = currentPlayer === "X"
    ? `${playerXName}'s Turn (X)`
    : `${playerOName}'s Turn (O)`;
}

function finalizeGame() {
  gameActive = false;
  setTimeout(() => {
    if (xWins > oWins) {
      showCongrats(`${playerXName} Wins with ${xWins} line(s)! 🎉`);
    } else if (oWins > xWins) {
      showCongrats(`${playerOName} Wins with ${oWins} line(s)! 🎉`);
    } else {
      showCongrats(`🤝 It's a Draw! (${xWins} - ${oWins})`);
    }
  }, 1200);
}

function findWinningLines() {
  const lines = [];

  // Horizontal
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c <= boardSize - 3; c++) {
      lines.push([r*boardSize+c, r*boardSize+c+1, r*boardSize+c+2]);
    }
  }

  // Vertical
  for (let c = 0; c < boardSize; c++) {
    for (let r = 0; r <= boardSize - 3; r++) {
      lines.push([r*boardSize+c, (r+1)*boardSize+c, (r+2)*boardSize+c]);
    }
  }

  // Diagonal down-right
  for (let r = 0; r <= boardSize - 3; r++) {
    for (let c = 0; c <= boardSize - 3; c++) {
      lines.push([r*boardSize+c, (r+1)*boardSize+c+1, (r+2)*boardSize+c+2]);
    }
  }

  // Diagonal down-left
  for (let r = 0; r <= boardSize - 3; r++) {
    for (let c = 2; c < boardSize; c++) {
      lines.push([r*boardSize+c, (r+1)*boardSize+c-1, (r+2)*boardSize+c-2]);
    }
  }

  const winningCombos = [];
  for (let line of lines) {
    const [a, b, c] = line;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      // Prevent duplicate scoring by marking
      if (!board.querySelector(`.cell[data-index="${a}"]`).classList.contains("used") ||
          !board.querySelector(`.cell[data-index="${b}"]`).classList.contains("used") ||
          !board.querySelector(`.cell[data-index="${c}"]`).classList.contains("used")) {
        board.querySelector(`.cell[data-index="${a}"]`).classList.add("used");
        board.querySelector(`.cell[data-index="${b}"]`).classList.add("used");
        board.querySelector(`.cell[data-index="${c}"]`).classList.add("used");
        winningCombos.push({combo: line, player: gameState[a]});
      }
    }
  }

  return winningCombos;
}

function drawWinningLine(combo, player) {
  const cells = board.querySelectorAll(".cell");
  const rect1 = cells[combo[0]].getBoundingClientRect();
  const rect2 = cells[combo[2]].getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  const x1 = rect1.left + rect1.width/2 - boardRect.left;
  const y1 = rect1.top + rect1.height/2 - boardRect.top;
  const x2 = rect2.left + rect2.width/2 - boardRect.left;
  const y2 = rect2.top + rect2.height/2 - boardRect.top;

  const length = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
  const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;

  const line = document.createElement("div");
  line.classList.add("winning-line", player);
  line.style.width = `${length}px`;
  line.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
  board.appendChild(line);
}

function showCongrats(message) {
  game.classList.add("hidden");
  congratsScreen.classList.remove("hidden");
  congratsMessage.textContent = message;
}

function resetGame() {
  createBoard();
}

function backToMenu() {
  congratsScreen.classList.add("hidden");
  game.classList.add("hidden");
  boardMenu.classList.add("hidden");
  nameMenu.classList.remove("hidden");
}
