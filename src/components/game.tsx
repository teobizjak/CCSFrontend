import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import socket from '../routes/socket'
import axios from 'axios'
import { useWallet } from '@solana/wallet-adapter-react'
import { useLocation } from 'react-router-dom'

export default function Game({ players, room, orientation, cleanup }) {
    const chess = useMemo(() => new Chess(), []) // <- 1
    const [fen, setFen] = useState(chess.fen()) // <- 2
    const [over, setOver] = useState('')
    const [offerDraw, setOfferDraw] = useState(false)
    const [drawOffered, setDrawOffered] = useState(false)
    const [gameStateMessage, setGameStateMessage] = useState('')
    const [clickedSquare, setClickedSquare] = useState(null)
    const { publicKey } = useWallet()
    const [timer1, setTimer1] = useState(10 * 60)
    const [timer2, setTimer2] = useState(10 * 60)
    const [customSquareStyles, setCustomSquareStyles] = useState({});
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
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    }

    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION

    const [userEloChange, setUserEloChange] = useState({
        whiteWin: {
            white: '0',
            black: '0',
        },
        blackWin: {
            white: '0',
            black: '0',
        },
        draw: {
            white: '0',
            black: '0',
        },
    })

    useEffect(() => {
        if (players.length > 1) {
            axios.post(`/gameUpdateDate/${room}`)
        }
    }, [players])

    useEffect(() => {
        socket.on('eloChanges', (dt) => {
            setUserEloChange(dt)
        })
    }, [userEloChange])

    useEffect(() => {
        console.log('players changed', JSON.stringify(players))
        const fetchData = async () => {
            try {
                console.log('updating me')

                const response = await axios.get(`/user/${publicKey}`)
                const userData = response.data
                setUser((prevUser) => ({
                    ...prevUser,
                    ...userData,
                }))
            } catch (error) {
                console.error('Error fetching user:', error)
            }
            if (players.length > 1) {
                try {
                    let opponentPublicKey =
                        orientation == 'white'
                            ? players[1].username
                            : players[0].username
                    console.log(
                        `updating opponent with wallet: ${opponentPublicKey}`
                    )
                    const response = await axios.get(
                        `/user/${opponentPublicKey}`
                    )
                    const oppData = response.data
                    setOpponent((prevOpp) => ({
                        ...prevOpp,
                        ...oppData,
                    }))
                    console.log("setting opponent to", response.data);
                    console.log(opponent);
                    
                    
                    console.log(response.data)
                } catch (error) {
                    console.error('Error fetching user:', error)
                }
            }
        }

        fetchData()
    }, [players])

    useEffect(() =>{
      console.log("opponent: ", JSON.stringify(opponent));
      
    }, [opponent])

    const makeAMove = useCallback(
        (move) => {
            if (over === '') {
                setDrawOffered(false)
                setOfferDraw(false)
                try {
                    const result = chess.move(move) // update Chess instance
                    setFen(chess.fen()) // update fen state to trigger a re-render

                    console.log(
                        'over, checkmate',
                        chess.isGameOver(),
                        chess.isCheckmate()
                    )

                    if (chess.isGameOver()) {
                        // check if move led to "game over"
                        if (chess.isCheckmate()) {
                            // if reason for game over is a checkmate
                            // Set message to checkmate.
                            setOver(
                                `${
                                    chess.turn() === 'w'
                                        ? 'Winner is black'
                                        : 'Winner is white'
                                }`
                            )
                            // The winner is determined by checking for which side made the last move
                        } else if (chess.isDraw()) {
                            // if it is a draw
                            setOver('It is a Draw') // set message to "Draw"
                        } else {
                            setOver('Game over')
                        }
                    }
                    console.log(`resultOfMove ${result}`)

                    return result
                } catch (e) {
                    return null
                } // null if the move was illegal, the move object if the move was legal
            }
        },
        [chess]
    )

    // onDrop function
    function onDrop(sourceSquare, targetSquare) {
        // orientation is either 'white' or 'black'. game.turn() returns 'w' or 'b'
        if (chess.turn() !== orientation[0]) return false // <- 1 prohibit player from moving piece of other player

        if (players.length < 2 || over !== '') return false // <- 2 disallow a move if the opponent has not joined

        const moveData = {
            from: sourceSquare,
            to: targetSquare,
            color: chess.turn(),
            promotion: 'q', // promote to queen where possible
        }

        const move = makeAMove(moveData)
        const user = orientation == 'white' ? players[0] : players[1]
        if (over === '') {
            if (move === null) return false
            socket.emit('move', {
                // <- 3 emit a move event.
                move,
                room,
                user,
                time: timer2,
            })
            return true
        } else {
            return false
        }
        // illegal move
    }

    useEffect(() => {
        socket.on('move', (dt) => {
            makeAMove(dt.move)
        })
        socket.on('sync', (dt) => {
            if (orientation === 'white') {
                setTimer2(Math.round(dt.whiteTimer))
                setTimer1(Math.round(dt.blackTimer))
            } else {
                setTimer1(Math.round(dt.whiteTimer))
                setTimer2(Math.round(dt.blackTimer))
            }
        })
    }, [makeAMove])
    
    useEffect(() => {
        let interval = null
        console.log(
            `Chess turn is ${chess.turn()} orientation is ${orientation}, pl: ${
                players.length
            } over: ${over}`
        )
        if (players.length > 1 && over === '') {
            if (chess.turn() !== orientation[0]) {
                interval = setInterval(() => {
                    setTimer1((timer1) => timer1 - 1)
                }, 1000)
            } else if (chess.turn() === orientation[0]) {
                interval = setInterval(() => {
                    setTimer2((timer2) => timer2 - 1)
                }, 1000)
            }
            return () => clearInterval(interval)
        }
    }, [chess.turn(), over, players])

    useEffect(() => {
        if (timer2 <= 0) {
            setOver('You lost on time')
        } else if (timer1 <= 0) {
            socket.emit('claimWinOnTime', { room, orientation })
        }
    }, [timer1, timer2])

    useEffect(() => {
        socket.on('playerDisconnected', (player) => {
            if (over === '') {
                console.log(`Opponent disconnected, winner ${orientation}`)
                setOver(
                    orientation.charAt(0).toUpperCase() + orientation.slice(1)
                ) // set game over
            }
        })
    }, [over])


    useEffect(() => {
        socket.on('winOnTime', (orientation) => {
            setOver(orientation + ' won on time')
        })
    }, [over])

    const [playerResigned, setPlayerResigned] = useState(false)

    useEffect(() => {
        // Listen for 'playerResigned' event
        socket.on('drawAccepted', () => {
            setOver('Draw')
        })
        socket.on('drawOffered', () => {
            setDrawOffered(true)
        })
        socket.on('playerResigned', (data) => {
            if (!playerResigned) {
                console.log(JSON.stringify(data))

                console.log(`Opponent resigned. Winner is ${data.winner}`)
                setOver(data.winner)
                setGameStateMessage(data.message)
                setPlayerResigned(true)
            }
        })

        // Cleanup listener on unmount
        return () => {
            socket.off('playerResigned')
        }
    }, [])

    useEffect(() => {
        socket.on('closeRoom', ({ roomId }) => {
            console.log('closeRoom', roomId, room)
            if (roomId === room) {
                cleanup()
            }
        })
    }, [room, cleanup])

    useEffect(() => {
        if (
            (over === 'Draw' && orientation === 'white') ||
            over == orientation.charAt(0).toUpperCase() + orientation.slice(1)
        ) {
            // Prepare your data
            const data = {
                whiteWallet: players[0].username, // replace with actual value
                blackWallet: players[1].username, // replace with actual value
                winner: over,
            }

            // Make a POST request
            axios
                .post('http://localhost:8080/postGameData', data) // replace 'your-endpoint' with actual endpoint
                .then((response) => {
                    console.log('Success:', response.data)
                })
                .catch((error) => {
                    console.error('Error:', error)
                })
        }
    }, [over])

    useEffect(() => {
        socket.on('updateFen', (data) => {
            setFen(data.fen)
            chess.loadPgn(data.pgn)
        })
    }, [fen])


    function handleResign() {
        const winTemp = orientation === 'white' ? 'Black' : 'White'
        const data = {
            message: `${orientation} has resigned.`,
            room: room, // replace with your room ID
            winner: winTemp, // replace with the winner's ID
        }
        // Emit 'resign' event to server
        socket.emit('resign', data)
        console.log('resign')
        setOver(orientation === 'white' ? 'Black' : 'White')
    }

    function handleOfferDraw() {
        console.log('offerDraw')
        socket.emit('offerDraw', {
            roomId: room,
        })
        setOfferDraw(true)
        console.log("opponent", JSON.stringify(opponent))
    }

    function handleAcceptDraw() {
        console.log('accept draw')
        socket.emit('acceptDraw', {
            roomId: room,
        })
    }

    function handleDeclineDraw() {
        console.log('decline draw')
        setDrawOffered(false)
    }

        
    function onSquareClick(square) {
      console.log('square clicked', square);
  
      if (chess.turn() !== orientation[0] || players.length < 2 || over !== '') {
          return false; // Prohibit if it's not the player's turn, or the game is over, or the opponent has not joined
      }
  
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
          // Highlight moves when a piece is clicked
          setClickedSquare(square);
          const moves = chess.moves({ square: square, verbose: true });
          const highlightStyles = moves.reduce((styles, move) => {
              return {
                  ...styles,
                  [move.to]: { background: "rgba(255, 255, 0, 0.4)" } // Highlight available moves
              };
          }, {});
          setCustomSquareStyles(highlightStyles);
          console.log('Available moves from ' + square + ': ', moves);
      } else {
          // Attempt to make a move and reset clickedSquare
          try {
              const moveData = {
                  from: clickedSquare,
                  to: square,
                  color: chess.turn(),
                  promotion: 'q', // Promote to queen where possible
              };
              const move = makeAMove(moveData);
              const user = orientation === 'white' ? players[0] : players[1];
              setClickedSquare(null);
              setCustomSquareStyles({}); // Clear highlighted squares
              if (move === null) return false;
              socket.emit('move', {
                  move,
                  room,
                  user,
                  time: timer2,
              });
          } catch (error) {
              console.log(error);
          }
      }
  }
  
  
  

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
                                Time: {formatTime(timer1)}
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
                                Time: {formatTime(timer2)}
                            </p>
                        </div>
                    </div>
                    <div className="flex h-96 w-full flex-col items-center justify-center md:w-1/2">
                        {over ? (
                            <>
                                <div>{over}</div>
                            </>
                        ) : (
                            <>
                                <button
                                    className="rounded-lg bg-red-500 px-12 py-4 text-2xl font-bold text-white"
                                    onClick={handleResign}
                                >
                                    Resign
                                </button>
                                {drawOffered ? (
                                    <>
                                        <button onClick={handleAcceptDraw}>
                                            Accept draw
                                        </button>
                                        <button onClick={handleDeclineDraw}>
                                            Decline draw
                                        </button>
                                    </>
                                ) : offerDraw ? (
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
