import React, { useState, useEffect } from 'react';

function GameHistoryBox({ chess, fenHistory, setIsPlayback, setPlaybackIndex }) {
  const [history, setHistory] = useState([]); // Initialize history as an array of turns
  

  useEffect(() => {

    const updateFen = () =>{
        fenHistory.push(chess.fen());
    }
    const updateHistory = () => {
      const moves = chess.history({ verbose: true }); // Get verbose history
      const newHistory = []; // Initialize a new history array to build

      moves.forEach((move, index) => {
        const turnIndex = Math.floor(index / 2); // Calculate turn index
        if (!newHistory[turnIndex]) {
          newHistory[turnIndex] = { fen: [] }; // Initialize turn object if it doesn't exist, with an array to store FENs
        }

        // Assign move to 'white' or 'black' property based on the move's color
        // and save the FEN string after each move
        if (move.color === 'w') {
          newHistory[turnIndex].white = move.san;// Save the FEN after white's move
        } else {
          newHistory[turnIndex].black = move.san;// Save the FEN after black's move
        }
      });

      setHistory(newHistory); // Update the state with the new history
    };
    updateHistory();
    updateFen();
    // This effect should run every time the `fen` string changes, indicating a new move has been made
  }, [chess, chess.fen()]);

  // Click handler to log the FEN of the clicked move
  const loadFen = (index) => () => {
    console.log("loading fen index", index);
    console.log("all fens", fenHistory);
    setIsPlayback(true);
    setPlaybackIndex(index);
  };

  return (
    <div>
      <ol className='list-decimal list-inside'>
        {history.map((turn, index) => (
          <li key={index}>
            {turn.white && (
              <span onClick={loadFen(2* index + 1)}>{`${turn.white} `}</span>
            )}
            {turn.black && (
              <span onClick={loadFen(2* index + 2)}>{` ${turn.black}`}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default GameHistoryBox;
