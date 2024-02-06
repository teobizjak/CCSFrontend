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
      console.log(`trigger update history chess`, chess);
      console.log(`trigger update history moves`, moves);

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

    if (index >= fenHistory.length) {
      console.log("index bigger or eq then fhl");
      setPlaybackIndex(index);
    }else{
      setPlaybackIndex(index);
    }
    setIsPlayback(true);
    
  };

  return (
    <div className="flex-grow overflow-y-auto max-h-72">
    <ol className="list-decimal list-inside text-white">
      {history.map((turn, index) => (
        <li key={index} className="list-decimal list-inside flex items-center justify-start my-1">
          <span className=' w-8'>{index + 1}. </span>
          
          <span 
            onClick={loadFen(2 * index + 1)} 
            className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded text-center mr-2 flex-1"
            style={{ minWidth: '20px' }}  // Set a minimum width to accommodate text
          >
            {turn.white || '...'}
          </span>
          <span 
            onClick={loadFen(2 * index + 2)} 
            className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded text-center flex-1"
            style={{ minWidth: '20px' }}  // Apply the same minimum width for consistency
          >
            {turn.black || '...'}
          </span>
        </li>
      ))}
    </ol>
  </div>
  
  );
}

export default GameHistoryBox;
