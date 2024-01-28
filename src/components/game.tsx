import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import socket from '../routes/socket'
import axios from 'axios'
import { useWallet } from '@solana/wallet-adapter-react'

export default function Game({ players, room, orientation, cleanup }) {
    const chess = useMemo(() => new Chess(), [])
    const [fen, setFen] = useState(chess.fen())
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
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        walletAddress: publicKey?.toBase58(),
        elo: 300,
        picture: 'avatar',
    })
    const [opponent, setOpponent] = useState({
        firstName: '',
        lastName: '',
        walletAddress: 'waiting...',
        elo: 300,
        picture: 'avatar',
    })
    const [userEloChange, setUserEloChange] = useState({
        whiteWin: { white: '0', black: '0' },
        blackWin: { white: '0', black: '0' },
        draw: { white: '0', black: '0' },
    })

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
            if (gameState.over === '') {
                setGameState((prevState) => ({
                    ...prevState,
                    offerDraw: false,
                    drawOffered: false,
                }))
                try {
                    const result = chess.move(move)
                    setFen(chess.fen())

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
                const response = await axios.get(`/user/${publicKey}`)
                const userData = response.data
                setUser(userData)
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }

        const fetchOpponentData = async () => {
            if (players.length > 1) {
                const opponentPublicKey =
                    orientation === 'white'
                        ? players[1].username
                        : players[0].username
                try {
                    const response = await axios.get(
                        `/user/${opponentPublicKey}`
                    )
                    const oppData = response.data
                    setOpponent(oppData)
                } catch (error) {
                    console.error('Error fetching opponent:', error)
                }
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
            setUserEloChange(dt)
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
            <div className="mx-auto h-full max-w-7xl bg-purple-100 px-4 sm:px-6 lg:px-8">
                <div className="flex h-full flex-col items-center justify-between md:flex-row">
                    <div className="h-auto w-full border-4 bg-gray-200 px-6 md:w-1/2 ">
                        <div className="flex w-full items-center justify-between py-6">
                            <p className="text-left text-2xl font-medium">
                                Opponent:{' '}
                                {
                                    opponent.firstName && opponent.lastName // Check if firstName and lastName exist
                                        ? `${opponent.firstName} ${opponent.lastName}` // If they exist, display them
                                        : opponent.walletAddress // Otherwise, display walletAddress
                                }
                                {'(' + opponent.elo + ')'}
                            </p>
                            <p className="text-right text-2xl font-medium">
                                Time: {formatTime(timers.timer1)}
                            </p>
                        </div>
                        <div>
                            <Chessboard
                                position={fen}
                                onPieceDrop={onDrop}
                                boardOrientation={orientation}
                                arePiecesDraggable={true}
                                onSquareClick={onSquareClick}
                                customSquareStyles={customSquareStyles}
                            />
                        </div>
                        <div className="flex w-full items-center justify-between py-8">
                            <p className="text-left text-2xl font-medium">
                                User:{' '}
                                {
                                    user.firstName && user.lastName // Check if firstName and lastName exist
                                        ? `${user.firstName} ${user.lastName}` // If they exist, display them
                                        : user.walletAddress // Otherwise, display walletAddress
                                }
                                {'(' + user.elo + ')'}
                                {orientation === 'white'
                                    ? userEloChange.whiteWin.white +
                                      ' | ' +
                                      userEloChange.draw.white +
                                      ' | ' +
                                      userEloChange.blackWin.white
                                    : userEloChange.blackWin.black +
                                      ' | ' +
                                      userEloChange.draw.black +
                                      ' | ' +
                                      userEloChange.whiteWin.black}
                            </p>
                            <p className="text-right text-2xl font-medium">
                                Time: {formatTime(timers.timer2)}
                            </p>
                        </div>
                    </div>
                    <div className="flex h-96 w-full flex-col items-center justify-center md:w-1/2">
                        {gameState.over ? (
                            <>
                                <div>{gameState.over}</div>
                            </>
                        ) : (
                            <>
                                <button
                                    className="rounded-lg bg-red-500 px-12 py-4 text-2xl font-bold text-white"
                                    onClick={handleResign}
                                >
                                    Resign
                                </button>
                                {gameState.drawOffered ? (
                                    <>
                                        <button onClick={handleAcceptDraw}>
                                            Accept draw
                                        </button>
                                        <button onClick={handleDeclineDraw}>
                                            Decline draw
                                        </button>
                                    </>
                                ) : gameState.offerDraw ? (
                                    <span className="rounded-lg bg-yellow-500 px-12 py-4 text-2xl font-bold text-white">
                                        Draw offered
                                    </span>
                                ) : (
                                    <button
                                        className="rounded-lg bg-yellow-500 px-12 py-4 text-2xl font-bold text-white"
                                        onClick={handleOfferDraw}
                                    >
                                        Offer Draw
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
