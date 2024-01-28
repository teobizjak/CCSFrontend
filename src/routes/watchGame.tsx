import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import socket from './socket'; // Ensure this is correctly set up for your WebSocket connection

export default function WatchGame() {
    const { roomId } = useParams();
    const chess = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(chess.fen());
    const [blackPlayer, setBlackPlayer] = useState({ elo: 0, firstName: '', lastName: '', walletAddress: 'waiting...', picture: 'avatar' });
    const [whitePlayer, setWhitePlayer] = useState({ elo: 0, firstName: '', lastName: '', walletAddress: 'waiting...', picture: 'avatar' });
    const [gameState, setGameState] = useState({
        over: '',
        offerDraw: false,
        drawOffered: false,
        gameStateMessage: '',
        clickedSquare: null,
    })
    const [timers, setTimers] = useState({ timer1: 10 * 60, timer2: 10 * 60 })


    // Utility function to fetch user data
    const fetchUserData = async (userId, setPlayer) => {
        try {
            const response = await axios.get(`/user/${userId}`);
            const userData = response.data;
            setPlayer(userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        // Join the room as a spectator
        socket.emit('joinRoomAsSpectator', { roomId });

        // Fetch the initial game state and player details
        const fetchGameStateAndPlayers = async () => {
            try {
                const response = await axios.get(`/game/${roomId}`);
                const { fen, black, white } = response.data;
                chess.load(fen);
                setFen(fen);

                // Fetch player details
                await fetchUserData(black, setBlackPlayer);
                await fetchUserData(white, setWhitePlayer);
            } catch (error) {
                console.error('Failed to fetch game state or player details:', error);
            }
        };

        fetchGameStateAndPlayers();

        // Listen for moves
        const handleMove = (move) => {
            console.log("handling move", move.move);
            
            chess.move(move.move);
            setFen(chess.fen());
        };

        socket.on('move', handleMove);

        socket.on('sync', (dt) => {
            if (orientation === 'white') {
                setTimers({
                    timer1: Math.round(dt.blackTimer),
                    timer2: Math.round(dt.whiteTimer),
                })
            } else {
                setTimers({
                    timer1: Math.round(dt.whiteTimer),
                    timer2: Math.round(dt.blackTimer),
                })
            }
        })


        // Listener for 'playerDisconnected' event
        socket.on('playerDisconnected', () => {
            if (gameState.over === '') {
                setGameState((prevState) => ({
                    ...prevState,
                    over: 'Opponent Disconnected',
                }))
            }
        })

        // Listener for 'winOnTime' event
        socket.on('winOnTime', (winningOrientation) => {
            setGameState((prevState) => ({
                ...prevState,
                over: `${winningOrientation} won on time`,
            }))
        })

        // Listener for 'playerResigned' event
        socket.on('playerResigned', (data) => {
            setGameState((prevState) => ({
                ...prevState,
                over: `${data.winner} won by resignation`,
                gameStateMessage: data.message,
            }))
        })

        // Listener for 'drawAccepted' and 'drawOffered' events
        socket.on('drawAccepted', () => {
            setGameState((prevState) => ({ ...prevState, over: 'Draw' }))
        })

        // Clean up on component unmount
        return () => {
            socket.off('move', handleMove);
        };
    }, [roomId, chess]);

    return (
        <div className="h-full w-full bg-gray-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen bg-purple-100 flex items-center justify-center">
    <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">

      {/* First Column: White Player Info and Chessboard */}
      <div className="col-span-2 bg-gray-200 border-4 p-8 flex flex-col justify-between">
        {/* White Player Info */}
        <div className="mb-8">
          <p className="text-center text-3xl font-medium">
            Black: {blackPlayer.firstName && blackPlayer.lastName ? `${blackPlayer.firstName} ${blackPlayer.lastName}` : blackPlayer.walletAddress ? `${blackPlayer.walletAddress.slice(0, 8)}...` : ""} ({blackPlayer.elo})
          </p>
        </div>

        {/* Chessboard */}
        <div className="flex justify-center">
          <Chessboard 
            position={fen} 
            boardOrientation="white" 
            arePiecesDraggable={false}
          />
        </div>

        {/* Black Player Info */}
        <div className="mt-8">
          <p className="text-center text-3xl font-medium">
            White: {whitePlayer.firstName && whitePlayer.lastName ? `${whitePlayer.firstName} ${whitePlayer.lastName}` : whitePlayer.walletAddress ? `${whitePlayer.walletAddress.slice(0, 8)}...` : ""} ({whitePlayer.elo})
          </p>
        </div>
      </div>

      {/* Second Column: Some text */}
      <div className="bg-gray-200 border-4 p-8">
        <p className="text-xl font-medium">
            {gameState.over ? gameState.over : "game is currently being played"}
        </p>
      </div>

    </div>
  </div>
</div>



    );
}
