import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import socket from '../routes/socket'
import axios from 'axios'
import { useWallet } from '@solana/wallet-adapter-react'
import GameUserData from './gameUserData'
import { getUserData } from '../functions/getUser'
import GameHistoryBox from './gameHistoryBox'



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
        (move) => {
            if (isPlayback === true) {
                setIsPlayback(false);
                setPlaybackIndex(fenHistory.length);
                return;
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
        [chess, gameState]
    )

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

    const handleLeftArrow = () => {
        if (playbackIndex > 0) {
            setIsPlayback(true);
            setPlaybackIndex(prevIndex => prevIndex - 1);
        }
        console.log(playbackIndex);
        
    };
    
    const handleRightArrow = () => {
        if (playbackIndex < fenHistory.length - 1) {
            setIsPlayback(true);
            setPlaybackIndex(prevIndex => prevIndex + 1);
        } else {
            setIsPlayback(false);
        }
        console.log(playbackIndex);
    };

    const handleKeyDown = (event) => {
        switch (event.key) {
          case 'ArrowLeft':
            handleLeftArrow();
            break;
          case 'ArrowRight':
            handleRightArrow();
            break;
          default:
            break;
        }
      };

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
                    if (move === null) return false
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

    // Socket event listeners and game logic
    useEffect(() => {
        // Listener for 'move' event from socket
        socket.on('move', (dt) => {
            makeAMove(dt.move)
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
                }else {
                    str += dt.draw.white
                } str+= " | " + dt.blackWin.white;
            }else{
                str += dt.blackWin.black + " | ";if (dt.draw.black > 0) {
                    str += "+" + dt.draw.black
                }else {
                    str += dt.draw.black
                } str+= " | " + dt.whiteWin.black;
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
        window.addEventListener('keydown', handleKeyDown);


        // Cleanup socket listeners on unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            socket.off('move')
            socket.off('sync')
            socket.off('eloChanges')
            socket.off('playerDisconnected')
            socket.off('winOnTime')
            socket.off('playerResigned')
            socket.off('drawAccepted')
            socket.off('drawOffered')
            socket.off('closeRoom')
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
  <div className="h-screen w-full bg-gray-900">
      <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-full flex-col items-center justify-between md:flex-row">
              <div className="h-auto max-w-[80vh] rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-700 px-6 text-white shadow-xl">
                  <div>
                      <div className="flex w-full items-center justify-between py-4">
                        <GameUserData user={opponent} timer={timers.timer1} name={"Opponent"}/>
                      </div>
                      <div>
                        <Chessboard
                            position={isPlayback === true ? fenHistory[playbackIndex] :fen}
                            onPieceDrop={onDrop}
                            boardOrientation={orientation}
                            arePiecesDraggable={true}
                            onSquareClick={onSquareClick}
                            customSquareStyles={customSquareStyles}
                            customArrowColor='#6B21A8'
                        />
                      </div>
                      <div className="flex w-full items-center justify-between py-4">
                        <GameUserData user={user} timer={timers.timer2} name={"You"} orientation={orientation}/>
                      </div>
                  </div>
              </div>
              <div className="flex flex-col w-full md:max-w-[calc(100%-80vh)] rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-700 px-6 py-4 overflow-hidden">
                  <div className="flex-grow overflow-auto">
                      <GameHistoryBox chess={chess} fenHistory={fenHistory} setIsPlayback={setIsPlayback} setPlaybackIndex={setPlaybackIndex}/>
                  </div>
                  <div className="flex justify-between mt-4">
                      <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                          Resign
                      </button>
                      <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                          Offer Draw
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          Report Cheating
                      </button>
                  </div>
              </div>
          </div>
      </div>
  </div>
)

}
