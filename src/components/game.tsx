import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import socket from '../routes/socket'
import axios from 'axios'
import { useWallet } from '@solana/wallet-adapter-react'
import GameUserData from './gameUserData'
import { getUserData } from '../functions/getUser'
import GameHistoryBox from './gameHistoryBox'
import { FaArrowLeft, FaCheck, FaChessBoard, FaExclamationTriangle, FaFlag, FaHandshake, FaSync, FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import Tooltip from './tooltip'



export default function Game({ players, room, orientation, cleanup }) {
    interface UserData {
        createdAt?: string;
        drawn?: number;
        elo?: number;
        eloK?: number;
        firstName?: string;
        lastName?: string;
        lost?: number;
        paid?: number;
        siteTitle?: string;
        title?: string;
        picture?: string;
        reported?: number;
        updatedAt?: string;
        walletAddress?: string;
        winnings?: number;
        won?: number;
    }
    const chess = useMemo(() => new Chess(), [])
    const [fen, setFen] = useState(chess.fen())
    const [isPlayback, setIsPlayback] = useState(false);
    const [resignModal, setResignModal] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [gameState, setGameState] = useState({
        over: '',
        offerDraw: false,
        drawOffered: false,
        gameStateMessage: '',
        clickedSquare: null,
    })
    const { publicKey } = useWallet()
    const [timers, setTimers] = useState({ timer1: 10 * 60, timer2: 10 * 60 })
    const [customSquareStyles, setCustomSquareStyles] = useState({})
    const [fenHistory, setFenHistory] = useState([]);
    const [user, setUser] = useState<UserData>({
        walletAddress: publicKey?.toBase58(),
        elo: 300,
        picture: 'avatar',
    })
    const [opponent, setOpponent] = useState<UserData>({
        walletAddress: 'waiting',
        elo: 300,
        picture: 'unknown',
    })
    const navigate = useNavigate();
    const [userEloChange, setUserEloChange] = useState({
        whiteWin: { white: '0', black: '0' },
        blackWin: { white: '0', black: '0' },
        draw: { white: '0', black: '0' },
    })
    const [userEloChangeWritable, setUserEloChangeWritable] = useState("0|0|0")

    // Utility functions
    const formatTime = useCallback((time) => {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    }, [])

    const makeAMove = useCallback(
        (move, fromOpponent = false) => {
            if (isPlayback && !fromOpponent) {
                setIsPlayback(false);
                // Optionally, you might want to revert to the last move made before playback started
                setPlaybackIndex(fenHistory.length - 1);
                return false; // Indicating that no move was made
            }

            // Exiting playback mode if the move is from the opponent or if a move is made outside playback
            if (isPlayback) {
                setIsPlayback(false);
                setPlaybackIndex(fenHistory.length);
            }

            setCustomSquareStyles({})
            if (gameState.over === '') {
                setGameState((prevState) => ({
                    ...prevState,
                    offerDraw: false,
                    drawOffered: false,
                }))
                try {
                    const result = chess.move(move)
                    setFen(chess.fen())
                    if (result) {
                        setPlaybackIndex(playbackIndex + 1);
                    }
                    if (chess.isGameOver()) {
                        if (chess.isCheckmate()) {
                            setGameState((prevState) => ({
                                ...prevState,
                                over:
                                    chess.turn() === 'w'
                                        ? 'Winner is black'
                                        : 'Winner is white',
                            }))
                        } else if (chess.isDraw()) {
                            setGameState((prevState) => ({
                                ...prevState,
                                over: 'It is a Draw',
                            }))
                        } else {
                            setGameState((prevState) => ({
                                ...prevState,
                                over: 'Game over',
                            }))
                        }
                    }
                    return result
                } catch (e) {
                    return null
                }
            }
        },
        [chess, gameState, isPlayback, playbackIndex]
    )
    const handleReportCheating = useCallback(() => {
        const cheater = orientation === 'white' ? 'Black' : 'White'
        const data = {
            message: `${orientation} has resigned.`,
            room,
            cheater: cheater,
        }
        socket.emit('reportCheating', data)
    }, [orientation, room])

    const handleResign = useCallback(() => {
        const winTemp = orientation === 'white' ? 'Black' : 'White'
        const data = {
            message: `${orientation} has resigned.`,
            room,
            winner: winTemp,
        }
        socket.emit('resign', data)
        setGameState((prevState) => ({ ...prevState, over: winTemp }))
    }, [orientation, room])
    const handleNewGame = useCallback(() => {
        navigate("/play");
    }, [])
    const handleHome = useCallback(() => {
        navigate("/home");
    }, [])

    const handleArrowBack = useCallback(() => {
        console.log("game state over is: ", gameState);

        if (gameState.over) {
            navigate("/home");
        } else {
            setResignModal(true);
        }
    }, [gameState])
    const handleCloseResignModal = useCallback(() => {
        setResignModal(false);
    }, [])
    const handleConfirmResign = useCallback(() => {
        handleResign();
        setResignModal(false);
        handleHome();
    }, [])

    const handleOfferDraw = useCallback(() => {
        socket.emit('offerDraw', { roomId: room })
        setGameState((prevState) => ({ ...prevState, offerDraw: true }))
    }, [room])

    const handleAcceptDraw = useCallback(() => {
        socket.emit('acceptDraw', { roomId: room })
    }, [room])

    const handleDeclineDraw = useCallback(() => {
        setGameState((prevState) => ({ ...prevState, drawOffered: false }))
    }, [])

    useEffect(() => {
        console.log("playback index", playbackIndex);
        console.log("playback active", isPlayback);

    }, [playbackIndex, isPlayback])



    const onDrop = useCallback(
        (sourceSquare, targetSquare) => {
            if (chess.turn() !== orientation[0]) return false
            if (players.length < 2 || gameState.over !== '') return false

            const moveData = {
                from: sourceSquare,
                to: targetSquare,
                color: chess.turn(),
                promotion: 'q',
            }
            
            const move = makeAMove(moveData)
            if (move === null || move === false) return false;
            const user = orientation === 'white' ? players[0] : players[1]
            if (gameState.over === '') {
                if (move === null) return false
                socket.emit('move', {
                    move,
                    room,
                    user,
                    time: timers.timer2,
                })
                return true
            } else {
                return false
            }
        },
        [chess, orientation, players, gameState, makeAMove, timers]
    )

    const onSquareClick = useCallback(
        (square) => {
            if (
                chess.turn() !== orientation[0] ||
                players.length < 2 ||
                gameState.over !== ''
            ) {
                return false
            }

            const piece = chess.get(square)
            if (piece && piece.color === chess.turn()) {
                setGameState((prevState) => ({
                    ...prevState,
                    clickedSquare: square,
                }))
                const moves = chess.moves({ square: square, verbose: true })
                const highlightStyles = moves.reduce((styles, move) => {
                    return {
                        ...styles,
                        [move.to]: { background: 'rgba(255, 255, 0, 0.4)' },
                    }
                }, {})
                setCustomSquareStyles(highlightStyles)
            } else {
                try {
                    const moveData = {
                        from: gameState.clickedSquare,
                        to: square,
                        color: chess.turn(),
                        promotion: 'q',
                    }
                    const move = makeAMove(moveData)
                    const user =
                        orientation === 'white' ? players[0] : players[1]
                    setGameState((prevState) => ({
                        ...prevState,
                        clickedSquare: null,
                    }))
                    setCustomSquareStyles({})
                    if (move === null || move === false) return false
                    socket.emit('move', {
                        move,
                        room,
                        user,
                        time: timers.timer2,
                    })
                } catch (error) {
                    console.error(error)
                }
            }
        },
        [
            chess,
            orientation,
            players,
            gameState,
            makeAMove,
            setCustomSquareStyles,
        ]
    )

    // Axios default settings
    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION

    // UseEffects for socket and game logic
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserData(publicKey); // Passing userId as a parameter
                console.log("myData", data);

                setUser(data);
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }

        const fetchOpponentData = async () => {
            if (players.length > 1) {
                const opponentPublicKey = orientation === 'white' ? players[1].username : players[0].username
                const data = await getUserData(opponentPublicKey); // Passing userId as a parameter
                console.log("opponentData", data);

                setOpponent(data);
            }
        }

        fetchUserData()
        fetchOpponentData()
    }, [players, publicKey, orientation])
    useEffect(() => {
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
                    } if (playbackIndex + 1 == fenHistory.length - 1) {
                        // Set isPlayback to false if playbackIndex reaches the end of fenHistory
                        setIsPlayback(false);
                    }
                    break;
                default:
                    // Handle other keys if needed
                    break;
            }
        };

        // Add event listener when component mounts
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup the event listener when component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [playbackIndex, fenHistory.length]);

    // Socket event listeners and game logic
    useEffect(() => {
        // Listener for 'move' event from socket
        socket.on('move', (dt) => {
            makeAMove(dt.move, true);
        })

        // Listener for 'sync' event from socket
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

        // Listener for 'eloChanges' event from socket
        socket.on('eloChanges', (dt) => {
            console.log("eloChanges", dt);

            let str = "";
            setUserEloChange(dt)
            if (orientation === "white") {
                str += " + " + dt.whiteWin.white + " | "; if (dt.draw.white > 0) {
                    str += " + " + dt.draw.white
                } else {
                    str += dt.draw.white
                } str += " | " + dt.blackWin.white;
            } else {
                str += dt.blackWin.black + " | "; if (dt.draw.black > 0) {
                    str += "+" + dt.draw.black
                } else {
                    str += dt.draw.black
                } str += " | " + dt.whiteWin.black;
            }
            console.log("eloChangesWritten", str);
            setUserEloChangeWritable(str);
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
        socket.on('drawOffered', () => {
            setGameState((prevState) => ({ ...prevState, drawOffered: true }))
        })

        // Listener for 'closeRoom' event
        socket.on('closeRoom', ({ roomId }) => {
            if (roomId === room) {
                cleanup()
            }
        })

        socket.on('errorOnMove', (dt) => {
            console.log(dt.turn);
            console.log(orientation[0]);
            if (dt.turn === orientation[0]) {
                alert("wrong move!");
            }
            
        })


        // Cleanup socket listeners on unmount
        return () => {
            socket.off('move')
            socket.off('sync')
            socket.off('eloChanges')
            socket.off('playerDisconnected')
            socket.off('winOnTime')
            socket.off('playerResigned')
            socket.off('drawAccepted')
            socket.off('drawOffered')
            socket.off('closeRoom')
            socket.off('errorOnMove')
        }
    }, [
        makeAMove,
        orientation,
        room,
        cleanup,
        gameState.over,
        publicKey,
        players,
    ])

    // Timer logic
    useEffect(() => {
        let interval
        if (players.length === 2 && gameState.over === '') {
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
    }, [players, chess, gameState.over, orientation])

    return (
        <div className="h-full w-full bg-gray-900 text-white relative">
            <button
                onClick={handleArrowBack}
                className="absolute top-0 left-0 m-4 text-white text-lg hover:text-purple-600 duration-1000 transition-colors"
            >
                <FaArrowLeft />
            </button>
            {resignModal && (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-white text-lg mb-4">Do you want to resign?</h2>
                        <div className="flex justify-around">
                            <button
                                onClick={handleConfirmResign}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleCloseResignModal}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-10 py-8 md:grid-cols-3">
                    <div className=" h-fit col-span-2 my-auto rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-700 px-6 text-white shadow-xl">
                        <div>
                            <div className="flex w-full items-center justify-between py-4">
                                <GameUserData user={opponent} timer={timers.timer1} name={"Opponent"} />
                            </div>
                            <div>
                                <Chessboard
                                    position={isPlayback === true ? fenHistory[playbackIndex] : fen}
                                    onPieceDrop={onDrop}
                                    boardOrientation={orientation}
                                    arePiecesDraggable={true}
                                    onSquareClick={onSquareClick}
                                    customSquareStyles={customSquareStyles}
                                    customArrowColor='#6B21A8'
                                />
                            </div>
                            <div className="flex w-full items-center justify-between py-4">
                                <GameUserData user={user} timer={timers.timer2} name={"You"} orientation={orientation} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-6xl font-bold flex mb-4 items-end">
                            <img
                                className="aspect-auto w-8 mr-2"
                                src="/logo192.png"
                                alt="Logo"
                            />
                            <span className="text-4xl">CryptoChess</span>
                            <span className="text-lg">.site</span>
                        </div>

                        <div className="flex flex-col col-span-1 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-700 px-4 py-2 overflow-hidden">

                            <div className='flex-grow'>
                                <div className='flex justify-between'>
                                    <div>
                                        {user.walletAddress?.slice(0, 8)}... - {opponent.walletAddress?.slice(0, 8)}...
                                    </div>

                                    <FaSync className=' text-white hover:text-purple-600 transition-colors duration-1000 cursor-pointer' />


                                </div>
                                <div>
                                    Elo changes: {userEloChangeWritable}
                                </div>
                            </div>
                            <div className="flex-grow overflow-auto bg-gray-900 rounded-lg px-4 py-8">
                                <GameHistoryBox chess={chess} fenHistory={fenHistory} setIsPlayback={setIsPlayback} setPlaybackIndex={setPlaybackIndex} />
                            </div>
                            <div className="flex justify-between mt-4 space-x-2 text-xs">
                                {gameState.over ? (
                                    <div className="text-center text-xs font-bold py-2 px-4 rounded bg-gray-600 flex-grow">
                                        {gameState.over}
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={handleResign} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center space-x-2 flex-grow">
                                            <FaFlag /> <span>Resign</span>
                                        </button>
                                        {gameState.drawOffered ? (
                                            <>
                                                <button onClick={handleAcceptDraw} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center space-x-2 flex-grow">
                                                    <FaCheck />
                                                </button>
                                                <button onClick={handleDeclineDraw} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center space-x-2 flex-grow">
                                                    <FaTimes />
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={handleOfferDraw} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center space-x-2 flex-grow">
                                                <FaHandshake /> <span>Offer Draw</span>
                                            </button>
                                        )}
                                    </>
                                )}
                                <button onClick={handleReportCheating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center space-x-2 flex-grow">
                                    <FaExclamationTriangle /> <span>Report</span>
                                </button>
                            </div>
                            <div className="flex justify-between mt-4 space-x-2 text-xs">
                                {gameState.over && (
                                    <>

                                        <button onClick={handleNewGame} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-grow">
                                            New Game
                                        </button>
                                        <button onClick={handleHome} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-grow">
                                            Home
                                        </button>
                                    </>

                                )}

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )

}
