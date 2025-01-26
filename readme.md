- INITIALIZATION => INITIAL BOARD RENDERING => DRAG & DROP FUNC => SOCKET FUNCTIONALITY --- client & server

# INITIALIZATION :> 
- Socket and Chess Objects are initialized .
- Board elements is selected from the dom 
- Initial values for dragged piece , srcSquare , & playerRole are set to null .

# INITIAL BOARD RENDERING :>
- renderBoard() shows initial state of chessboard .

# DRAG & DROP FUNC :>
- renderBoard() sets up drag & drop event listner for each piece and square
- pieces are draggable based on player's role .
-When a piece is dragged , dragged piece and sourceSquare are set .
- When a piece is dropped, handleMove() is called to handle the move logic and emit to the server.


     BROWSER 1 <-------->   SERVER   <-------->BROWSER 2

------------------------------------------------------------------------------------------------------

# Variables Client Side

- Socket = connection to the server using the Socket.io
- Chess = An instance of the chess class
- BoardElement = DOM element with the id "ChessBoard"
- DraggedPiece = The piecebeing dragged by the dragged and drop functionality
- SourceSquare = Stores the starting square of the dragged piece
- PlayerRole  = Holds the role of rhe player eg W for white ; B for black   

-------------------------------------------------------------------------------------------------------

# Func. Client Side          Socket Client Side

RenderBoard                Socket.On("PlayerRole")
HandleMove                 Socket.On("SpectatorRole") 
GetPieceUnicode            Socket.On("BoardState")  
                           Socket.On("Move") 

--------------------------------------------------------------------------------------------------------

# Function/Event                             Purpose/Action

'renderBoard'             Renders the chessboard, sets up pieces and squares, adds event
                          listeners for drag-and-drop functionality, updates board orientation.

'handleMove'              Constructs a move object, emits a "move" event through the socket.

getPieceUnicode           Returns the Unicode character for a given chess piece.

socket.on("playerRole")   Sets the player's role, calls 'renderBoard' to update the board.

socket.on("spectatorRole") Sets 'playerRole' to null, calls 'renderBoard' to update the board.

socket.on("boardState")    Loads a FEN string into the chess game, calls 'renderBoard' to
update the board.

socket.on("move")          Applies a move to the chess game, calls 'renderBoard' to update the
                           board.