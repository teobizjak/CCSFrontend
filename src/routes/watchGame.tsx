import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import socket from './socket'; // Ensure this is correctly set up for your WebSocket connection
import GameUserData from '../components/gameUserData';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';
import GameHistoryBox from '../components/gameHistoryBox';

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
    const [isPlayback, setIsPlayback] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [fenHistory, setFenHistory] = useState([]);
    const [orientation, setOrientation] = useState("white");
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

    const loadPgnAndGetFenHistory = (pgn) => {
        console.log("loadpgnandsethistorystart");
        
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
        fens.push(chess.fen());
    
        setFenHistory(fens);
      };

      useEffect(() => {
        let interval
        if (gameState.over === '') {
            interval = setInterval(() => {
                setTimers((prevTimers) => {
                    const newTimers = { ...prevTimers }

                    // Decrement timer1 if it's the opponent's turn, else decrement timer2
                    if (
                        (chess.turn() === 'w' && orientation !== 'white') ||
                        (chess.turn() === 'b' && orientation !== 'black')
                    ) {
                        newTimers.timer1--
                    } else {
                        newTimers.timer2--
                    }

                    return newTimers
                })
            }, 1000)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [chess, gameState.over, orientation])

    useEffect(() => {
        console.log("useeff trigger");
        console.log("pb index", playbackIndex);
        console.log("fen on this pb index", fenHistory[playbackIndex]);
        
        
        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    // Decrease playbackIndex if it's more than 0
                    if (playbackIndex > 0) {
                        setPlaybackIndex((prevIndex) => prevIndex - 1);
                        setIsPlayback(true);
                    }
                    break;
                case 'ArrowRight':
                    // Increase playbackIndex if it's less than fenHistory.length
                    console.log(`checking if playbackindex ${playbackIndex + 1} === fhl ${fenHistory.length - 1}`);

                    if (playbackIndex < fenHistory.length - 1) {
                        setPlaybackIndex((prevIndex) => prevIndex + 1);
                        setIsPlayback(true);
                    } if (playbackIndex == fenHistory.length - 1) {
                        // Set isPlayback to false if playbackIndex reaches the end of fenHistory
                        setIsPlayback(false);
                    }
                    break;
                default:
                    // Handle other keys if needed
                    break;
            }
        };
        
        // Join the room as a spectator
        socket.emit('joinRoomAsSpectator', { roomId });

        // Fetch the initial game state and player details
        const fetchGameStateAndPlayers = async () => {
            try {
                const response = await axios.get(`/game/${roomId}`);
                console.log("gotGamefromdb");
                const { fen, black, white, turn, whiteTime, blackTime, duration, pgn } = response.data;
                setFen(fen);
                // Assuming response.data.updatedAt is in a suitable format to create a Date object
                const updatedAtDate = new Date(response.data.updatedAt);
                const currentTime = new Date();
                const timeDifference = Math.round((currentTime - updatedAtDate) / 1000); // Time difference in seconds

                // Calculate the remaining time for each player
                // Subtract the time consumed by each player from the total duration
                // If it's the player's turn, also subtract the time elapsed since the last update
                // Calculate the remaining time for each player
                const remainingWhiteTime = Math.max(0, Math.round(duration - whiteTime - (turn === 'w' ? timeDifference : 0)));
                const remainingBlackTime = Math.max(0, Math.round(duration - blackTime - (turn === 'b' ? timeDifference : 0)));

                // Function to format time in seconds to mm:ss
                

                // Update the timers with the formatted remaining time for each player
                setTimers({
                    timer2: remainingWhiteTime,
                    timer1: remainingBlackTime
                });

                console.log("setTimers");
                // Load the FEN string to the chess board
                chess.loadPgn(pgn);
                console.log("loadpgnandsethistorycall");
                loadPgnAndGetFenHistory(pgn);

                // Update the FEN state
                setFen(fen);

                // Log whose turn it is
                if (turn === 'w') {
                    console.log("white turn");
                } else if (turn === 'b') {
                    console.log("black turn");
                }

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
            setIsPlayback(false);
            setPlaybackIndex(fenHistory.length);
        };

        socket.on('move', handleMove);

        socket.on('sync', (dt) => {

                setTimers({
                    timer1: Math.round(dt.blackTimer),
                    timer2: Math.round(dt.whiteTimer),
                })

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
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup the event listener when component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            socket.off('move', handleMove);
        };

    }, [roomId, chess, playbackIndex]);

    return (
        <div className="h-full w-full bg-gray-900">
            <div className="mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-14 py-8 md:grid-cols-7">
                    <div className=" h-fit col-span-4 my-auto rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-700 px-6 text-white shadow-xl">
                        {/* White Player Info */}

                        <div>
                            <div className="flex w-full items-center justify-between py-4">
                                <GameUserData user={blackPlayer} timer={timers.timer1} name={"Opponent"} />
                            </div>
                            <div>
                                <Chessboard
                                    position={isPlayback === true ? fenHistory[playbackIndex] : fen}
                                    boardOrientation={"white"}
                                    arePiecesDraggable={false}
                                    customArrowColor='#6B21A8'
                                />
                            </div>
                            <div className="flex w-full items-center justify-between py-4">
                                <GameUserData user={whitePlayer} timer={timers.timer2} name={"You"} />
                            </div>
                        </div>

                    </div>

                    <div className='col-span-3'>
                        <div className="text-6xl font-bold  flex mb-4 items-end text-white">
                            <img
                                className="aspect-auto w-8 mr-2"
                                src="/logo192.png"
                                alt="Logo"
                            />
                            <span className="text-4xl">CryptoChess</span>
                            <span className="text-lg">.site</span>
                        </div>

                        <div className="flex flex-col rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-700 px-4 py-2 overflow-hidden text-white">

                            <div className='flex-grow'>
                                <div className='flex justify-between'>
                                    <div>
                                        {whitePlayer.walletAddress?.slice(0, 8)}... - {blackPlayer.walletAddress?.slice(0, 8)}...
                                    </div>

                                    <FaSync className=' text-white hover:text-purple-600 transition-colors duration-1000 cursor-pointer' />


                                </div>

                            </div>
                            <div className="flex-grow overflow-auto bg-gray-900 rounded-lg px-4 py-8">
                                <GameHistoryBox chess={chess} fenHistory={fenHistory} setIsPlayback={setIsPlayback} setPlaybackIndex={setPlaybackIndex} />
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>



    );
}

