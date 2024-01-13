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

    axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
    const [userEloChange, setUserEloChange] = useState({
      whiteWin:{
        white: "0",
        black:"0"
      },
      blackWin:{
        white: "0",
        black:"0"
      },
      draw:{
        white: "0",
        black:"0"
      },
    });
    const [user, setUser] = useState({
      firstName: "",
      lastName: "",
      walletAddress: publicKey?.toBase58(),
      elo: 300,
      picture: "avatar"
    });
    const [opponent, setOpponent] = useState({
      firstName: "",
      lastName: "",
      walletAddress: "waiting...",
      elo: 300,
      picture: "avatar"
    });
    useEffect(() => {
      if (players.length > 1) {
        axios.post(`/gameUpdateDate/${room}`)
      }
    }, [players]); 
    useEffect(() => {
      socket.on("eloChanges", (dt) => {
        setUserEloChange(dt);
      });
    }, [userEloChange]); 
    useEffect(() => {
      console.log("players changed");
      const fetchData = async () => {
        try {
          console.log("updating me");
          
          const response = await axios.get(`/user/${publicKey}`);
          const userData = response.data;
          setUser(prevUser => ({
            ...prevUser,
            ...userData
          }));          
        } catch (error) {
          console.error('Error fetching user:', error);
        }        
        if (players.length > 1) {
          try {
            let opponentPublicKey = orientation=="white" ? players[1].username : players[0].username;
            console.log(`updating opponent with wallet: ${opponentPublicKey}`);
            const response = await axios.get(`/user/${opponentPublicKey}`);
            const oppData = response.data;
            setOpponent(prevOpp => ({
              ...prevOpp,
              ...oppData
            }));      
            console.log(response.data);
                
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }
      };
  
      fetchData();
    }, [players]); 
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
                    `${chess.turn() === "w" ? "Winner is black" : "Winner is white"}`
                  ); 
                  // The winner is determined by checking for which side made the last move
                } else if (chess.isDraw()) { // if it is a draw
                  setOver("It is a Draw"); // set message to "Draw"
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
        time: timer2,
      });
      return true;
      }else{
        return false;
      }
      // illegal move
      
    }
  
    useEffect(() => {
      socket.on("move", (dt) => {
        makeAMove(dt.move);
      });
      socket.on("sync", (dt) => {
        if (orientation === "white") {
          setTimer2(Math.round(dt.whiteTimer))
          setTimer1(Math.round(dt.blackTimer))
        }else{
          setTimer1(Math.round(dt.whiteTimer))
          setTimer2(Math.round(dt.blackTimer))
        }
      });
    }, [makeAMove]);
    useEffect(() =>{
      const user = orientation==="white" ? players[0] : players[1];
      const opponent = orientation==="white" ? players[1] : players[0];
      console.log(`user: ${user}`);
      console.log(`opponent: ${opponent}`);
      
    }, [players])

    useEffect(() => {
      let interval = null;
      console.log(`Chess turn is ${chess.turn()} orientation is ${orientation}, pl: ${players.length} over: ${over}`);
      if (players.length > 1 && over === "") {
        
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
    }, [chess.turn(), over, players]);
  
    useEffect(() => {
      if (timer2 <= 0) {
        setOver("You lost on time");
      }else if (timer1 <= 0) {
        socket.emit("claimWinOnTime", {room, orientation});
      }
    }, [timer1, timer2]);
    useEffect(() => {
      socket.on('playerDisconnected', (player) => {
        if (over === "") {
          console.log(`Opponent disconnected, winner ${orientation}`);
          setOver(orientation.charAt(0).toUpperCase() + orientation.slice(1)); // set game over
        }
      });
    }, [over]);

    useEffect(() => {
      socket.on('winOnTime', (orientation) => {
        setOver(orientation + " won on time");
      });
    }, [over]);

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
    console.log("over", over);
    console.log("ori", orientation);
    console.log("opponent", opponent);
    
    
  }

  return (
    <div className="h-screen w-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full bg-purple-100">
        <div className="flex flex-col md:flex-row justify-between items-center h-full">
          <div className="w-full md:w-1/2 h-auto bg-gray-200 border-4 px-6 ">
            <div className="flex justify-between items-center py-6 w-full">
            <p className="text-2xl font-medium text-left">
              Opponent: {
                opponent.firstName && opponent.lastName // Check if firstName and lastName exist
                  ? `${opponent.firstName} ${opponent.lastName}` // If they exist, display them
                  : opponent.walletAddress // Otherwise, display walletAddress
              }{"(" + opponent.elo + ")"}
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
                arePiecesDraggable={true}
              />
            </div>
            <div className="flex justify-between items-center py-8 w-full">
            <p className="text-2xl font-medium text-left">
              User: {
                user.firstName && user.lastName // Check if firstName and lastName exist
                  ? `${user.firstName} ${user.lastName}` // If they exist, display them
                  : user.walletAddress // Otherwise, display walletAddress
              }{"(" + user.elo + ")"}{orientation === "white" ? userEloChange.whiteWin.white + " | " + userEloChange.draw.white + " | " + userEloChange.blackWin.white : userEloChange.blackWin.black + " | " + userEloChange.draw.black + " | " + userEloChange.whiteWin.black}
            </p>
              <p className="text-2xl font-medium text-right">
                Time: {formatTime(timer2)}
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-96 flex flex-col justify-center items-center">
          {over ? (

            <>
            <div>{over}</div>
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