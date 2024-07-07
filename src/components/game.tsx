import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import socket from '../routes/socket'
import axios from 'axios'
import { useWallet } from '@solana/wallet-adapter-react'
import GameUserData from './gameUserData'
import { getUserData } from '../functions/getUser'
import GameHistoryBox from './gameHistoryBox'
import {
    FaArrowLeft,
    FaCheck,
    FaChessBoard,
    FaExclamationTriangle,
    FaFlag,
    FaHandshake,
    FaSquare,
    FaSync,
    FaTimes,
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import Tooltip from './tooltip'

export default function Game({ players, room, orientation, cleanup }) {
    interface UserData {
        createdAt?: string
        drawn?: number
        elo?: number
        eloK?: number
        firstName?: string
        lastName?: string
        lost?: number
        paid?: number
        siteTitle?: string
        title?: string
        picture?: string
        reported?: number
        updatedAt?: string
        walletAddress?: string
        winnings?: number
        won?: number
    }
    const chess = useMemo(() => new Chess(), [])
    const [fen, setFen] = useState(chess.fen())
    const [isPlayback, setIsPlayback] = useState(false)
    const [resignModal, setResignModal] = useState(false)
    const [showPromotionDialog, setShowPromotionDialog] = useState(false)
    const [promotionFrom, setPromotionFrom] = useState(null)
    const [promotionTo, setPromotionTo] = useState(null)
    const [token, setToken] = useState('none')
    const [playbackIndex, setPlaybackIndex] = useState(0)
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
    const [fenHistory, setFenHistory] = useState([])
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
    const navigate = useNavigate()
    const [userEloChange, setUserEloChange] = useState({
        whiteWin: { white: '0', black: '0' },
        blackWin: { white: '0', black: '0' },
        draw: { white: '0', black: '0' },
    })
    const [promotionPiece, setPromotionPiece] = useState('q')
    const [userEloChangeWritable, setUserEloChangeWritable] = useState('0|0|0')

    // Utility functions
    useEffect(() => {
        if (publicKey) {
            const tk = localStorage.getItem(`token-${publicKey.toString()}`)
            if (tk) {
                setToken(tk)
            }
        }
    }, [publicKey])
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
                setIsPlayback(false)
                // Optionally, you might want to revert to the last move made before playback started
                setPlaybackIndex(fenHistory.length - 1)
                return false // Indicating that no move was made
            }

            // Exiting playback mode if the move is from the opponent or if a move is made outside playback
            if (isPlayback) {
                setIsPlayback(false)
                setPlaybackIndex(fenHistory.length)
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
                        setPlaybackIndex(playbackIndex + 1)
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
            message: `${orientation} reported cheating.`,
            room,
            cheater: cheater,
        }
        socket.emit('reportCheating', data)
    }, [orientation, room])

    const handleResign = useCallback(() => {
        const winTemp = orientation === 'white' ? 'Black' : 'White'
        const data = {
            token: localStorage.getItem(`token-${publicKey.toString()}`),
            message: `${orientation} has resigned.`,
            room,
            winner: winTemp,
        }
        socket.emit('resign', data)
        setGameState((prevState) => ({ ...prevState, over: winTemp }))
    }, [orientation, room])
    const handleNewGame = useCallback(() => {
        navigate('/play')
    }, [])
    const handleHome = useCallback(() => {
        navigate('/home')
    }, [])

    const handleArrowBack = useCallback(() => {
        console.log('game state over is: ', gameState)

        if (gameState.over) {
            navigate('/home')
        } else {
            setResignModal(true)
        }
    }, [gameState])
    const handleCloseResignModal = useCallback(() => {
        setResignModal(false)
    }, [])
    const handleConfirmResign = useCallback(() => {
        handleResign()
        setResignModal(false)
        handleHome()
    }, [])

    const handleOfferDraw = useCallback(() => {
        console.log("params: ", promotionFrom, promotionTo, showPromotionDialog);
        socket.emit('offerDraw', {
            roomId: room,
            token: localStorage.getItem(`token-${publicKey.toString()}`),
        })
        setGameState((prevState) => ({ ...prevState, offerDraw: true }))
    }, [room])

    const handleAcceptDraw = useCallback(() => {
        socket.emit('acceptDraw', {
            roomId: room,
            token: localStorage.getItem(`token-${publicKey.toString()}`),
        })
    }, [room])

    const handleDeclineDraw = useCallback(() => {
        setGameState((prevState) => ({ ...prevState, drawOffered: false }))
    }, [])

    useEffect(() => {
        console.log('playback index', playbackIndex)
        console.log('playback active', isPlayback)
    }, [playbackIndex, isPlayback])

    const onDrop = useCallback(
        (sourceSquare, targetSquare, piece) => {
            console.log('source square', sourceSquare)
            console.log('target square', targetSquare)

            if (
                ((piece === 'wP' &&
                    sourceSquare[1] === '7' &&
                    targetSquare[1] === '8') ||
                    (piece === 'bP' &&
                        sourceSquare[1] === '2' &&
                        targetSquare[1] === '1')) &&
                Math.abs(
                    sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0)
                ) <= 1
            ) {
                console.log('is promotion start drop')
                console.log('source:', sourceSquare)
                console.log('target:', targetSquare)
                setPromotionFrom(sourceSquare)
                setPromotionTo(targetSquare)
                setShowPromotionDialog(true)
                console.log('is promotion end drop')
                return false
            }
            if (chess.turn() !== orientation[0]) return false
            if (players.length < 2 || gameState.over !== '') return false

            const moveData = {
                from: sourceSquare,
                to: targetSquare,
                color: chess.turn(),
                promotion: 'q',
            }

            const move = makeAMove(moveData)
            if (move === null || move === false) return false
            const user = orientation === 'white' ? players[0] : players[1]
            if (gameState.over === '') {
                if (move === null) return false
                console.log(`emitting move pk: ${publicKey}, tk: ${token}`)

                socket.emit('move', {
                    token: localStorage.getItem(
                        `token-${publicKey.toString()}`
                    ),
                    publicKey,
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
                        promotion: promotionPiece,
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
                    console.log(`emitting move pk: ${publicKey}, tk: ${token}`)

                    socket.emit('move', {
                        token: localStorage.getItem(
                            `token-${publicKey.toString()}`
                        ),
                        publicKey,
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
                const data = await getUserData(publicKey) // Passing userId as a parameter
                console.log('myData', data)

                setUser(data)
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
                const data = await getUserData(opponentPublicKey) // Passing userId as a parameter
                console.log('opponentData', data)

                setOpponent(data)
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
                        setPlaybackIndex((prevIndex) => prevIndex - 1)
                        setIsPlayback(true)
                    }
                    break
                case 'ArrowRight':
                    // Increase playbackIndex if it's less than fenHistory.length
                    console.log(
                        `checking if playbackindex ${playbackIndex + 1
                        } === fhl ${fenHistory.length - 1}`
                    )

                    if (playbackIndex < fenHistory.length - 1) {
                        setPlaybackIndex((prevIndex) => prevIndex + 1)
                        setIsPlayback(true)
                    }
                    if (playbackIndex + 1 == fenHistory.length - 1) {
                        // Set isPlayback to false if playbackIndex reaches the end of fenHistory
                        setIsPlayback(false)
                    }
                    break
                default:
                    // Handle other keys if needed
                    break
            }
        }

        // Add event listener when component mounts
        window.addEventListener('keydown', handleKeyDown)

        // Cleanup the event listener when component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [playbackIndex, fenHistory.length])

    // Socket event listeners and game logic
    useEffect(() => {
        // Listener for 'move' event from socket
        socket.on('move', (dt) => {
            makeAMove(dt.move, true)
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
            console.log('eloChanges', dt)

            let str = ''
            setUserEloChange(dt)
            if (orientation === 'white') {
                str += ' + ' + dt.whiteWin.white + ' | '
                if (dt.draw.white > 0) {
                    str += ' + ' + dt.draw.white
                } else {
                    str += dt.draw.white
                }
                str += ' | ' + dt.blackWin.white
            } else {
                str += dt.blackWin.black + ' | '
                if (dt.draw.black > 0) {
                    str += '+' + dt.draw.black
                } else {
                    str += dt.draw.black
                }
                str += ' | ' + dt.whiteWin.black
            }
            console.log('eloChangesWritten', str)
            setUserEloChangeWritable(str)
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
            console.log(dt.turn)
            console.log(orientation[0])
            if (dt.turn === orientation[0]) {
                alert('wrong move!')
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
                        if (newTimers.timer1 <= 0) {
                            const data = {
                                room: room,
                                orientation: orientation,
                            }
                            socket.emit('claimWinOnTime', data)
                        }
                    } else {
                        newTimers.timer2--
                        if (newTimers.timer2 <= 0) {
                            const data = {
                                room: room,
                                orientation:
                                    orientation === 'white' ? 'black' : 'white',
                            }
                            socket.emit('claimWinOnTime', data)
                        }
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
        <div className="relative h-full w-full bg-gray-900 text-white">
            <button
                onClick={handleArrowBack}
                className="absolute left-0 top-0 m-4 text-lg text-white transition-colors duration-1000 hover:text-purple-600"
            >
                <FaArrowLeft />
            </button>
            {resignModal && (
                <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-gray-900 bg-opacity-75">
                    <div className="rounded-lg bg-gray-800 p-6">
                        <h2 className="mb-4 text-lg text-white">
                            Do you want to resign?
                        </h2>
                        <div className="flex justify-around">
                            <button
                                onClick={handleConfirmResign}
                                className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleCloseResignModal}
                                className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="mx-auto min-h-screen max-w-7xl px-1 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-0 md:gap-10 py-8 md:grid-cols-3">
                    <div className="order-2 md:order-1 col-span-2 my-auto h-fit rounded-lg bg-gray-800 px-0 md:px-6 text-white shadow-xl transition-colors duration-700 hover:bg-gray-700">
                        <div>
                            <div className="flex w-full items-center justify-between py-4">
                                <GameUserData
                                    user={opponent}
                                    timer={timers.timer1}
                                    name={'Opponent'}
                                    isPlaying={gameState.over == '' && true}
                                />
                            </div>
                            <div>
                                <Chessboard
                                    position={
                                        isPlayback === true
                                            ? fenHistory[playbackIndex]
                                            : fen
                                    }
                                    onPieceDrop={onDrop}
                                    boardOrientation={orientation}
                                    arePiecesDraggable={true}
                                    onSquareClick={onSquareClick}
                                    customSquareStyles={customSquareStyles}
                                    customArrowColor="#6B21A8"
                                    showPromotionDialog={showPromotionDialog}
                                    onPromotionCheck={(
                                        sourceSquare,
                                        targetSquare,
                                        piece
                                    ) => {
                                        console.log("checking for promotion: ", sourceSquare, targetSquare, piece);
                                        console.log("prev params: ", promotionFrom, promotionTo, showPromotionDialog);
                                        
                                        
                                        if (
                                            ((piece === 'wP' &&
                                                sourceSquare[1] === '7' &&
                                                targetSquare[1] === '8') && orientation === 'white' ||
                                                (piece === 'bP' &&
                                                    sourceSquare[1] === '2' &&
                                                    targetSquare[1] === '1' && orientation === 'black')) &&
                                            Math.abs(
                                                sourceSquare.charCodeAt(0) -
                                                targetSquare.charCodeAt(0)
                                            ) <= 1
                                        ) {
                                            console.log('is promotion start')
                                            console.log('source:', sourceSquare)
                                            console.log('target:', targetSquare)
                                            console.log('pd:', showPromotionDialog)
                                            setPromotionFrom(sourceSquare)
                                            setPromotionTo(targetSquare)
                                            setShowPromotionDialog(true)
                                            console.log('is promotion end')
                                            console.log("new params: ", promotionFrom, promotionTo, showPromotionDialog);
                                        }
                                    }}
                                    onPromotionPieceSelect={(p) => {
                                        if (p) {
                                            const moveData = {
                                                from: promotionFrom,
                                                to: promotionTo,
                                                color: chess.turn(),
                                                promotion: p
                                                    .slice(-1)
                                                    .toLowerCase(),
                                            }
                                            console.log(
                                                'promotion move data: ',
                                                moveData
                                            )
                                            const move = makeAMove(moveData)
                                            if (move === null || move === false)
                                                return false
                                            console.log(
                                                `emitting move pk: ${publicKey}, tk: ${token}`
                                            )
                                            setPromotionFrom(null);
                                            setPromotionTo(null);
                                            setShowPromotionDialog(false);

                                            console.log("new params after move: ", promotionFrom, promotionTo, showPromotionDialog);

                                            socket.emit('move', {
                                                token: localStorage.getItem(
                                                    `token-${publicKey.toString()}`
                                                ),
                                                publicKey,
                                                move,
                                                room,
                                                user,
                                                time: timers.timer2,
                                            })

                                            return true
                                        } else {
                                            return false
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex w-full items-center justify-between py-4">
                                <GameUserData
                                    user={user}
                                    timer={timers.timer2}
                                    name={'You'}
                                    orientation={orientation}
                                    isPlaying={gameState.over == '' && true}
                                />
                            </div>
                            <div className='md:hidden bg-gray-900 grid grid-cols-4 gap-1 py-2 px-1 rounded-b-lg'>
                                {gameState.over ? (
                                     <>
                                     <div className='text-center text-white mb-2 col-span-4'>
                                       {gameState.over}
                                     </div>
                                     <button className='w-full  hover:bg-gray-700 text-white rounded-md px-4 py-3 col-span-2 bg-blue-900' onClick={handleHome}>
                                       Home
                                     </button>
                                     <button className='w-full hover:bg-gray-700 text-white rounded-md px-4 py-3 col-span-2 bg-blue-900' onClick={handleNewGame}>
                                       New Game
                                     </button>
                                     <div className='flex justify-center items-center hover:bg-gray-800 rounded-md px-2 py-3 col-span-2 text-blue-600' onClick={handleReportCheating}>
                                            <FaExclamationTriangle className='mr-2'/> Report
                                        </div>
                                        <div className='flex justify-center items-center hover:bg-gray-800 rounded-md px-2 py-3 col-span-2 text-sm'>
                                            {userEloChangeWritable}
                                        </div>
                                   </>
                                ) : gameState.drawOffered ? (
                                    <>
                                        <div className='flex justify-center items-center hover:bg-gray-800 rounded-md px-2 py-3 text-green-600' onClick={handleAcceptDraw}>
                                            <FaCheck />
                                        </div>
                                        <div className='flex justify-center items-center hover:bg-gray-800 rounded-md px-2 py-3 text-red-600' onClick={handleDeclineDraw}>
                                            <FaTimes/>
                                        </div>
                                        <div className='col-span-2 flex justify-center items-center text-white'>
                                            Draw Offered
                                        </div>
                                        
                                    </>
                                ) : (
                                    <>
                                        <div className='flex justify-center items-center hover:bg-gray-800 rounded-md px-2 py-3 text-red-600' onClick={handleResign}>
                                            <FaFlag/>
                                        </div>
                                        <div className='flex justify-center items-center hover:bg-gray-800 rounded-md px-2 py-3 text-yellow-600' onClick={handleOfferDraw}>
                                            <FaHandshake/>
                                        </div>
                                        <div className='flex justify-center items-center hover:bg-gray-800 rounded-md px-2 py-3 text-blue-600' onClick={handleReportCheating}>
                                            <FaExclamationTriangle/>
                                        </div>
                                        <div className='flex justify-center items-center hover:bg-gray-800 rounded-md px-2 py-3 text-sm'>
                                            {userEloChangeWritable}
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                    <div className='order-1 md:order-2 mx-auto md:mx-0 w-full block'>
                        <div className="mb-4 flex items-end text-6xl font-bold justify-center md:justify-start ">
                            <img
                                className="mr-2 aspect-auto w-6 md:w-8"
                                src="/logo192.png"
                                alt="Logo"
                            />
                            <span className="text-2xl sm:text-3xl md:text-4xl">CryptoChess</span>
                            <span className="text-lg">.site</span>
                        </div>

                        <div className="col-span-1 hidden md:flex flex-col overflow-hidden rounded-lg bg-gray-800 px-4 py-2 transition-colors duration-700 hover:bg-gray-700">
                            <div className="flex-grow">
                                <div className="flex justify-between">
                                    <div className="flex items-center">
                                        {orientation === 'white' ? (
                                            <FaSquare className=" mr-1 rounded text-white" />
                                        ) : (
                                            <FaSquare className=" mr-1 rounded text-black" />
                                        )}
                                        {user.walletAddress?.slice(0, 8)}... -{' '}
                                        {orientation === 'white' ? (
                                            <FaSquare className=" mx-1 rounded text-black" />
                                        ) : (
                                            <FaSquare className=" mx-1 rounded text-white" />
                                        )}
                                        {opponent.walletAddress?.slice(0, 8)}...
                                    </div>

                                    <FaSync className=" cursor-pointer text-white transition-colors duration-1000 hover:text-purple-600" />
                                </div>
                                <div>Elo changes: {userEloChangeWritable}</div>
                            </div>
                            <div className="flex-grow overflow-auto rounded-lg bg-gray-900 px-4 py-8">
                                <GameHistoryBox
                                    chess={chess}
                                    fenHistory={fenHistory}
                                    setIsPlayback={setIsPlayback}
                                    setPlaybackIndex={setPlaybackIndex}
                                />
                            </div>
                            <div className="mt-4 flex justify-between space-x-2 text-xs">
                                {gameState.over ? (
                                    <div className="flex-grow rounded bg-gray-600 px-4 py-2 text-center text-xs font-bold">
                                        {gameState.over}
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleResign}
                                            className="flex flex-grow items-center justify-center space-x-2 rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                                        >
                                            <FaFlag /> <span>Resign</span>
                                        </button>
                                        {gameState.drawOffered ? (
                                            <>
                                                <button
                                                    onClick={handleAcceptDraw}
                                                    className="flex flex-grow items-center justify-center space-x-2 rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    onClick={handleDeclineDraw}
                                                    className="flex flex-grow items-center justify-center space-x-2 rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={handleOfferDraw}
                                                className="flex flex-grow items-center justify-center space-x-2 rounded bg-yellow-600 px-4 py-2 font-bold text-white hover:bg-yellow-700"
                                            >
                                                <FaHandshake />{' '}
                                                <span>Offer Draw</span>
                                            </button>
                                        )}
                                    </>
                                )}
                                <button
                                    onClick={handleReportCheating}
                                    className="flex flex-grow items-center justify-center space-x-2 rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                                >
                                    <FaExclamationTriangle />{' '}
                                    <span>Report</span>
                                </button>
                            </div>
                            <div className="mt-4 flex justify-between space-x-2 text-xs">
                                {gameState.over && (
                                    <>
                                        <button
                                            onClick={handleNewGame}
                                            className="flex-grow rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                                        >
                                            New Game
                                        </button>
                                        <button
                                            onClick={handleHome}
                                            className="flex-grow rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                                        >
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
