import axios from 'axios';
import { Chess } from 'chess.js';
import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { toast } from 'react-toastify';

const ChessViewToolCard = ({ game, token, onUpdate }) => {
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
    const [gameId, setGameId] = useState(game?.gameId || '1111');
    const [fen, setFen] = useState(game?.fen || '8/8/8/8/8/8/8/8 w KQkq - 0 1');
    const [index, setIndex] = useState(0);
    const [pgn, setPgn] = useState(null);
    const [fenHistory, setFenHistory] = useState([]);
    const [result, setResult] = useState('');
    const chess = useRef(new Chess());

    const loadPgnAndGetFenHistory = (pgn) => {
        const newGame = new Chess();
        newGame.loadPgn(pgn);

        const moves = newGame.history({ verbose: true });
        const fens = [];

        // Reset the game to start position
        newGame.reset();

        // Iterate over the moves and make each move to generate the FEN history
        for (let move of moves) {
            fens.push(newGame.fen());
            newGame.move(move);
        }
        fens.push(newGame.fen());  // Add the final FEN after all moves
        setIndex(fens.length - 1);

        setFenHistory(fens);

        // Determine the game result
    };

    useEffect(() => {
        try {
            if (game) {
                console.log(game);
                
                chess.current.loadPgn(game.pgn);
                setFen(chess.current.fen());
                loadPgnAndGetFenHistory(game.pgn);                
                setResult(game.winner)
                setPgn(game.pgn)
                setGameId(game.roomId)
            }
        } catch (error) {
            console.log(error);
        }
    }, [game]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    handleLeftArrow();
                    break;
                case 'ArrowRight':
                    handleRightArrow();
                    break;
                case 'ArrowUp':
                    event.preventDefault();  // Prevent page scroll
                    setIndex(fenHistory.length - 1);
                    setFen(fenHistory[fenHistory.length - 1]);
                    break;
                case 'ArrowDown':
                    event.preventDefault();  // Prevent page scroll
                    setIndex(0);
                    setFen(fenHistory[0]);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fenHistory, index]);

    const handleLeftArrow = () => {
        if (index > 0) {
            setIndex((prevIndex) => prevIndex - 1);
            setFen(fenHistory[index - 1]);
        }
    };

    const handleCheating = (gameId, cheated) => {
        return async () => {
            console.log(gameId);
             

            
            try {
                const response = await axios.post('/reviewGame', 
                    {
                        gameId: gameId,
                        cheated: cheated
                    }, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`  // Add token to authorization header
                        }
                    }
                );
    
                // Handle the response
                if (response.data.valid) {
                    toast.success(`Game reviewed successfully. Cheated: ${cheated}`);
                    onUpdate()
                } else {
                    toast.error('Failed to review the game. Invalid token or game.');
                }
            } catch (error) {
                console.error('Error reporting cheating:', error);
                toast.error('Error reporting cheating.');
            }
        };
    };

    const handleRightArrow = () => {
        if (index < fenHistory.length - 1) {
            setIndex((prevIndex) => prevIndex + 1);
            setFen(fenHistory[index + 1]);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pgn)
            .then(() => toast.success("PGN copied to clipboard"))
            .catch((err) => toast.error("Failed to copy PGN"));
    };
    if (game == null) {
        return(
            <div className="rounded p-4 mx-auto bg-gray-800 text-white text-center">
            No games to review from current group
        </div>
        )
    }else{return (
        <div className="rounded p-4 max-w-md mx-auto">
            <div className="text-center mb-4">
                <p className={`text-lg ${result ? 'text-white' : 'text-red-700'}`}>
                    winner: {result || 'In Progress'}
                </p>
                {pgn && 
                <button
                    onClick={copyToClipboard}
                    className="bg-gray-600 text-white px-4 py-2 rounded mt-2"
                >
                    Copy PGN
                </button>
}
            </div>
            <div className="flex justify-center mb-4">
                <Chessboard position={fen} /> {/* Smaller chessboard */}
            </div>
            <div className="flex justify-center gap-2 mt-4">
                <button
                    onClick={handleLeftArrow}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                    {"<"}
                </button>
                <button
                    onClick={handleRightArrow}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                    {">"}
                </button>
            </div>
            <div className="flex justify-between mt-4">
                <button
                    onClick={handleCheating(gameId, true)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                >
                    Cheated
                </button>
                <button
                    onClick={handleCheating(gameId, false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Not Cheated
                </button>
            </div>
        </div>
    );}

    
};

export default ChessViewToolCard;
