const chess = new Chess();
const socket = io() // this sends a req to backend to io.on
const boardElement = document.querySelector(".chessboard")

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;  // role is decided by server

let whiteTime = 3000; // Initial time in seconds
let blackTime = 3000; 
let whiteTimerInterval, blackTimerInterval;

//Score Variables
let whiteScore = 0;
let blackScore = 0;

function startWhiteTimer() {
    whiteTimerInterval = setInterval(() => {
        whiteTime--;
        updateTimerDisplay('white', whiteTime);
        // Check if time's up for white
    }, 1000);
}

function startBlackTimer() {
    blackTimerInterval = setInterval(() => {
        blackTime--;
        updateTimerDisplay('black', blackTime);
        // Check if time's up for black
    }, 1000);
}

function updateTimerDisplay(color, time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById(color + '-timer').innerText = 
        color.charAt(0).toUpperCase() + color.slice(1) + ': ' + 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; 
}

function updateScoreDisplay() {
    document.getElementById('white-score').innerText = whiteScore;
    document.getElementById('black-score').innerText = blackScore;
}

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
      row.forEach((square, squareindex) => {
          const squareElement = document.createElement("div");
          squareElement.classList.add("square", (rowindex + squareindex) % 2 === 0 ? "light" : "dark");
          squareElement.dataset.row = rowindex;
          squareElement.dataset.col = squareindex;

          if (square) {
              const piece = document.createElement("div");
              piece.classList.add("piece", square.color === "w" ? "white" : "black");

              piece.innerText = getPieceUnicode(square); 
              piece.draggable = playerRole === square.color;

              piece.addEventListener("dragstart", (e) => {
                  if (piece.draggable) {
                      draggedPiece = piece;
                      sourceSquare = { row: rowindex, col: squareindex };
                      e.dataTransfer.setData("text/plain", "");
                  }
              });

              piece.addEventListener("dragend", () => {
                  draggedPiece = null;
                  sourceSquare = null;
              });

              squareElement.appendChild(piece);
          }

          squareElement.addEventListener("dragover", (e) => {
              e.preventDefault();
          });

          squareElement.addEventListener("drop", (e) => {
              e.preventDefault();
              if (draggedPiece) {
                  const targetSquare = {
                      row: parseInt(squareElement.dataset.row),
                      col: parseInt(squareElement.dataset.col),
                  };

                  handleMove(sourceSquare, targetSquare);
              }
          });

          boardElement.appendChild(squareElement);
      });
  });

  if(playerRole === 'b'){
    boardElement.classList.add("flipped")
  }
  else{
    boardElement.classList.remove("flipped")
  }
};
const handleMove = (source , target)=>{
    const move = { // col -> alphabets & rows -> num
        from: `${String.fromCharCode(97+ source.col)}${8- source.row}`, 
        to: `${String.fromCharCode(97+ target.col)}${8- target.row}` ,
        promotion: 'q', // whn opponent's pawn reaches last stage 
    }
    socket.emit("move",move)

    if (chess.turn() === 'b') {
        clearInterval(whiteTimerInterval); // Stop white's timer
        startBlackTimer();                // Start black's timer
    } else {
        clearInterval(blackTimerInterval); // Stop black's timer
        startWhiteTimer();                // Start white's timer
    }

    if (chess.isGameOver()) {
        handleGameOver();
    }
}

function handleGameOver() {
    clearInterval(whiteTimerInterval);
    clearInterval(blackTimerInterval);

    if (chess.isCheckmate()) {
        if (chess.turn() === 'b') {
            whiteScore++;
        } else {
            blackScore++;
        }
        updateScoreDisplay();
        // Additional logic for checkmate (e.g., display a message)
        alert("Checkmate! Game Over."); 
    }
    chess.reset();
    renderBoard();
}

const getPieceUnicode = (piece)=>{
    const unicodePieces = {
        p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
        P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
    };
    return unicodePieces[piece.type] || ""
}

socket.emit("timerUpdate", { whiteTime, blackTime });

socket.on("timerUpdate", (times) => {
  whiteTime = times.whiteTime;
  blackTime = times.blackTime;
  updateTimerDisplay('white', whiteTime);
  updateTimerDisplay('black', blackTime);
});

socket.on("playerRole" , (role)=>{
    playerRole =  role
    if (playerRole === 'w') { 
        startWhiteTimer(); 
    } else if (playerRole === 'b') {
        startBlackTimer();
    }
    renderBoard()
})

socket.on("spectatorRole" , ()=>{
    playerRole = null
    renderBoard()
})

socket.on("boardState", (fen)=>{
    chess.load(fen)   // loading new board
    renderBoard()
})

socket.on("move", (move)=>{
    chess.move(move)
    renderBoard()
})
renderBoard()