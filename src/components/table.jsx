import React, { useEffect, useCallback } from 'react';
import '../styles/table.css';
import { sounds } from '../utilities/audio';
import { isCheck } from '../utilities/utility.js';
import dot from '/dot.svg';
import circle from '/circle.svg';
import { itemDataWhite, itemDataBlack } from '../utilities/constants';
import PromotionChoices from './promotion.jsx';
import { FenConverter } from '../utilities/FENconverter.js';
import fetchNextMove from '../utilities/nextMove.js';

// BoardLabels: Renders row and column labels
const BoardLabels = ({ me }) => (
  <div className='alpha' style={{ transform: me === "black" ? "rotate(180deg)" : "none" }}>
    {Array.from({ length: 8 }, (_, i) => <p key={i} className='alphapets'>{String.fromCharCode(i + 65)}</p>)}
  </div>
);

// ChessCell: Renders a single cell
const ChessCell = ({
  i, j, element, selectedPiece, isPossibleMove, stylePossibleMove, Style, me, currentPlayer, board, movesHistory, itemData, handlePromotion, makeAMove, suggest, mode, id, gameId, socket, setSelectedPiece
}) => {
  const checkStyle = {
    boxShadow: 'inset 0px 0px 10px 10px #c13636 ',
  };
  return (
    <div
      className={`chess-cell ${(j + i) % 2 === 0 ? "white" : "brown"}`}
      style={{ ...Style(i, j, element), transform: me === "black" ? "rotate(180deg)" : "none" }}
      key={`cell-${i}-${j}`}
      onClick={() => {
        if (mode === "1 vs Computer" && currentPlayer.color === "black") {
          return;
        }
        if (mode === "online" && me !== currentPlayer.color) {
          return;
        }
        if (isPossibleMove([i, j])) {
          makeAMove(i, j, selectedPiece, id, gameId, socket, mode, me);
        } else {
          suggest(element);
        }
      }}
    >
      {element != null ?
        ((element.name === "pawn" && (j === 7 || j === 0)) ?
          <PromotionChoices
            itemData={itemData}
            piece={selectedPiece}
            onPromotion={handlePromotion}
            reverse={j === 7}
          />
          :
          <img
            style={element.color === currentPlayer.color && element.name === "king" && isCheck(board, currentPlayer.color, movesHistory) ? checkStyle : {}}
            className={`piece `}
            src={element.image}
            alt={element.name}
          />) : (<></>)}
    </div>
  );
};

// ChessBoardGrid: Renders the chessboard grid
const ChessBoardGrid = ({
  board, selectedPiece, isPossibleMove, stylePossibleMove, Style, me, currentPlayer, movesHistory, itemData, handlePromotion, makeAMove, suggest, mode, id, gameId, socket, setSelectedPiece
}) => (
  <div
    className='table-container'
    style={{ transform: me === "black" ? "rotate(180deg)" : "none" }}
  >
    {board.map((column, j) => (
      <div className="chess-row" key={`row-${j}`}>
        {column.map((element, i) => (
          <ChessCell
            key={`cell-${i}-${j}`}
            i={i}
            j={j}
            element={element}
            selectedPiece={selectedPiece}
            isPossibleMove={isPossibleMove}
            stylePossibleMove={stylePossibleMove}
            Style={Style}
            me={me}
            currentPlayer={currentPlayer}
            board={board}
            movesHistory={movesHistory}
            itemData={itemData}
            handlePromotion={handlePromotion}
            makeAMove={makeAMove}
            suggest={suggest}
            mode={mode}
            id={id}
            gameId={gameId}
            socket={socket}
            setSelectedPiece={setSelectedPiece}
          />
        ))}
      </div>
    ))}
    <BoardLabels me={me} />
  </div>
);

const Table = React.memo(({
  board,
  setBoard,
  player1,
  player2,
  setPlayer1,
  setPlayer2,
  movesHistory,
  setMovesHistory,
  currentPlayer,
  setCurrentPlayer,
  setGameOver,
  mode,
  me = "white",
  socket = "",
  id = "",
  gameId = "",
  selectedPiece,
  setSelectedPiece,
  possibleMoves,
  setPossibleMoves,
  makeAMove,
  fullMove,
  getEngineMove
}) => {
  const itemData = currentPlayer.color === "white" ? itemDataWhite : itemDataBlack;

  const suggest = useCallback((piece) => {
    if (!piece || piece.color !== currentPlayer.color) return;
    const moves = piece.possible_moves(board, movesHistory);
    setPossibleMoves(moves);
    setSelectedPiece(piece);
  }, [board, movesHistory, currentPlayer.color, setPossibleMoves, setSelectedPiece]);

  const isPossibleMove = ([x, y]) => {
    for (let i = 0; i < possibleMoves.length; i++) {
      if (possibleMoves[i][0] === x && possibleMoves[i][1] === y) {
        return true;
      }
    }
    return false;
  };

  const stylePossibleMove = (i, j) => {
    const isEmpty = (x, y) => board[y][x] === null;
    return {
      backgroundImage: isEmpty(i, j) ? `url(${dot})` : `url(${circle})`,
      backgroundSize: isEmpty(i, j) ? '70% 70%' : "100% 100%",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    };
  };

  const selectedStyle = {
    boxShadow: 'inset 0px 0px 10px 10px  #aca56fbc',
  };

  const Style = (i, j, element) => {
    if (!selectedPiece) {
      return {};
    }
    if (element === selectedPiece) return selectedStyle;
    if (isPossibleMove([i, j])) return stylePossibleMove(i, j);
    return {};
  };

  const handlePromotion = (item, piece) => {
    piece.name = item.name;
    piece.image = item.src;
    piece.value = item.value;
    setBoard([...board]);
    sounds.promotion.play();
    setSelectedPiece(null);
  };

  // Online mode: listen for moves from the server
  useEffect(() => {
    if (mode === "online" && me !== currentPlayer.color) {
      socket.on("recieveMove", (data) => {
        let { move, sourceSquareY, sourceSquareX, destinationSquareY, destinationSquareX, newboard, movesHistory, color, sound } = data;
        setSelectedPiece(board[sourceSquareX][sourceSquareY]);
        try {
          makeAMove(destinationSquareY, destinationSquareX, board[sourceSquareX][sourceSquareY], id, gameId, socket, mode, me);
        } catch (error) {
          console.error('Error while making a move:', error);
        }
      });
    }
  }, [mode, me, currentPlayer.color, socket, board, makeAMove, setSelectedPiece, id, gameId]);

  // Vs Computer mode: use Stockfish API for black moves
  useEffect(() => {
    if (mode === "1 vs Computer" && currentPlayer.color === "black") {
      getEngineMove().then(bestMove => {
        const sourceSquareY = bestMove[0].charCodeAt(0) - 'a'.charCodeAt(0);
        const sourceSquareX = 8 - Number(bestMove[1]);
        const destinationSquareY = bestMove[2].charCodeAt(0) - 'a'.charCodeAt(0);
        const destinationSquareX = 8 - Number(bestMove[3]);
        setSelectedPiece(board[sourceSquareX][sourceSquareY]);
        makeAMove(
          destinationSquareY,
          destinationSquareX,
          board[sourceSquareX][sourceSquareY],
          id,
          gameId,
          socket,
          mode,
          me
        );
      }).catch(error => {
        console.error('Error while getting next move:', error);
      });
    }
  }, [mode, currentPlayer.color, board, movesHistory, fullMove, getEngineMove, makeAMove, setSelectedPiece, id, gameId, socket, me]);

  return (
    <div className='container-chess-table'>
      <div className="chess-table">
        <ul>
          <li>8</li>
          <li>7</li>
          <li>6</li>
          <li>5</li>
          <li>4</li>
          <li>3</li>
          <li>2</li>
          <li>1</li>
        </ul>
        <ChessBoardGrid
          board={board}
          selectedPiece={selectedPiece}
          isPossibleMove={isPossibleMove}
          stylePossibleMove={stylePossibleMove}
          Style={Style}
          me={me}
          currentPlayer={currentPlayer}
          movesHistory={movesHistory}
          itemData={itemData}
          handlePromotion={handlePromotion}
          makeAMove={makeAMove}
          suggest={suggest}
          mode={mode}
          id={id}
          gameId={gameId}
          socket={socket}
          setSelectedPiece={setSelectedPiece}
        />
      </div>
    </div>
  );
});

export default Table;