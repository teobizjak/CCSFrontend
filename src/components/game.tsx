import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import socket from '../routes/socket';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLocation } from 'react-router-dom';


export default function Game({ players, room, orientation, cleanup }) {
    const chess = useMemo(() => new Chess(), []); // <- 1
    const [fen, setFen] = useState(chess.fen()); // <- 2
    const [over, setOver] = useState("");
    const [gameStateMessage, setGameStateMessage] = useState('');
    const { publicKey } = useWallet();
    const [timer1, setTimer1] = useState(10 * 60);
    const [timer2, setTimer2] = useState(10 * 60);
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    //const [whitePlayer, setWhitePlayer] = useState(players[0].username)
    //const [blackPlayer, setBlackPlayer] = useState(players[1].username)
    const makeAMove = useCallback(
      (move) => {
        if (over === "") {
            try {
              const result = chess.move(move); // update Chess instance
              setFen(chess.fen()); // update fen state to trigger a re-render
        
              console.log("over, checkmate", chess.isGameOver(), chess.isCheckmate());
        
              if (chess.isGameOver()) { // check if move led to "game over"
                if (chess.isCheckmate()) { // if reason for game over is a checkmate
                  // Set message to checkmate. 
                  setOver(
                    `${chess.turn() === "w" ? "Black" : "White"}`
                  ); 
                  // The winner is determined by checking for which side made the last move
                } else if (chess.isDraw()) { // if it is a draw
                  setOver("Draw"); // set message to "Draw"
                } else {
                  setOver("Game over");
                }
              }
              console.log(`resultOfMove ${result}`);
              
              return result;
            } catch (e) {
              return null;
            } // null if the move was illegal, the move object if the move was legal
        }
      },
      [chess]
    );
  
    // onDrop function
    function onDrop(sourceSquare, targetSquare) {
      // orientation is either 'white' or 'black'. game.turn() returns 'w' or 'b'
      if (chess.turn() !== orientation[0]) return false; // <- 1 prohibit player from moving piece of other player
  
      if (players.length < 2 || over !=="") return false; // <- 2 disallow a move if the opponent has not joined
  
      const moveData = {
        from: sourceSquare,
        to: targetSquare,
        color: chess.turn(),
        promotion: "q", // promote to queen where possible
      };

      
  
      const move = makeAMove(moveData);
      const user = orientation=="white" ? players[0] : players[1];
      const opponent = orientation=="white" ? players[1] : players[0];
      if (over === ""){
        if (move === null) return false;
      socket.emit("move", { // <- 3 emit a move event.
        move,
        room,
        user,
      }); // this event will be transmitted to the opponent via the server
  
      return true;
      }else{
        return false;
      }
      // illegal move
      
    }
  
    useEffect(() => {
      socket.on("move", (move) => {
        makeAMove(move); //
      });
    }, [makeAMove]);
    useEffect(() =>{
      var user = orientation==="white" ? players[0] : players[1];
      var opponent = orientation==="white" ? players[1] : players[0];
      console.log(`user: ${user}`);
      console.log(`opponent: ${opponent}`);
      
    }, [players])

    useEffect(() => {
      let interval = null;
      console.log(`Chess turn is ${chess.turn()} orientation is ${orientation}, pl: ${players.length} over: ${over}`);
      if (players.length > 1 && over === "" && chess.pgn() !== "") {
        
        if (chess.turn() !== orientation[0]) {
          interval = setInterval(() => {
            setTimer1((timer1) => timer1 - 1);
          }, 1000);
        } else if (chess.turn() === orientation[0]) {
          interval = setInterval(() => {
            setTimer2((timer2) => timer2 - 1);
          }, 1000);
        }
        return () => clearInterval(interval);
      }
    }, [chess.turn(), over]);
  
        
    useEffect(() => {
      socket.on('playerDisconnected', (player) => {
        if (over === "") {
          console.log(`Opponent disconnected, winner ${orientation}`);
          setOver(orientation.charAt(0).toUpperCase() + orientation.slice(1)); // set game over
        }
      });
    }, []);

    const [playerResigned, setPlayerResigned] = useState(false);

useEffect(() => {
  // Listen for 'playerResigned' event
  socket.on('playerResigned', (data) => {
    if (!playerResigned) {
      console.log(JSON.stringify(data));
      
      console.log(`Opponent resigned. Winner is ${data.winner}`);
      setOver(data.winner);
      setGameStateMessage(data.message);
      setPlayerResigned(true);
    }
  });

  // Cleanup listener on unmount
  return () => {
    socket.off('playerResigned');
  };
}, []);
    
    useEffect(() => {
      socket.on('closeRoom', ({ roomId }) => {
        console.log('closeRoom', roomId, room)
        if (roomId === room) {
          cleanup();
        }
      });
    }, [room, cleanup]);

    useEffect(() => {
      if ((over === "Draw" && orientation === "white")  || over == orientation.charAt(0).toUpperCase() + orientation.slice(1)) {
        // Prepare your data
        const data = {
          whiteWallet: players[0].username, // replace with actual value
          blackWallet: players[1].username, // replace with actual value
          winner: over,
        };
    
        // Make a POST request
        axios.post('http://localhost:8080/postGameData', data) // replace 'your-endpoint' with actual endpoint
        .then(response => {
          console.log('Success:', response.data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    }, [over]);
  
  function handleResign() {
    const winTemp = orientation === "white" ? "Black" : "White";

    const data = {
      message: `${orientation} has resigned.`,
      room: room, // replace with your room ID
      winner: winTemp, // replace with the winner's ID
    };

    // Emit 'resign' event to server
    socket.emit('resign', data);

    console.log("resign");
    setOver(orientation === "white" ? "Black" : "White");
  }
  


  function handleOfferDraw() {
    console.log("offerDraw");
    console.log(over);
    
  }

  return (
    <div className="h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full bg-purple-100">
        <div className="flex flex-col md:flex-row justify-between items-center h-full">
          <div className="w-full md:w-1/2 h-auto bg-gray-200 border-4 px-6 ">
            <div className="flex justify-between items-center py-6 w-full">
              <p className="text-2xl font-medium text-left">
                Opponent: {players.length < 2 ? "Waiting..." : orientation=="white" ? players[1].username.slice(0,8) : players[0].username.slice(0,8)}...
              </p>
              <p className="text-2xl font-medium text-right">
                Time: {formatTime(timer1)}
              </p>
            </div>
            <div>
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation={orientation}
              />
            </div>
            <div className="flex justify-between items-center py-8 w-full">
              <p className="text-2xl font-medium text-left">
              You:  {players.length < 2 ? publicKey?.toBase58().slice(0,8) : orientation==="white" ? players[0].username.slice(0,8) : players[1].username.slice(0,8)}...
              </p>
              <p className="text-2xl font-medium text-right">
                Time: {formatTime(timer2)}
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-96 flex flex-col justify-center items-center">
          {over ? (

            <>
            <div>Winner is {over}</div>
            </>
          ) : (
            <>
              <button
                className="px-12 py-4 bg-red-500 text-white text-2xl font-bold rounded-lg"
                onClick={handleResign}
              >
                Resign
              </button>
              <button
                className="px-12 py-4 bg-yellow-500 text-white text-2xl font-bold rounded-lg"
                onClick={handleOfferDraw}
              >
                Offer Draw
              </button>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}