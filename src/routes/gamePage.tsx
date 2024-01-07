import { useState, useEffect, useCallback } from 'react';
import Game from '../components/game';
import socket from './socket';
import InitGame from '../components/initGame';


export default function GamePage() {
  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [players, setPlayers] = useState([]);

  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers([]);
  }, []);
  
  useEffect(() => {
    // const username = prompt("Username");
    // setUsername(username);
    // socket.emit("username", username);

    socket.on("opponentJoined", (roomData) => {
      console.log("roomData", roomData)
      setPlayers(roomData.players);
    });
  }, []);
  return(
    room ? (
      <Game
        room={room}
        orientation={orientation}
        players={players}
        // the cleanup function will be used by Game to reset the state when a game is over
        cleanup={cleanup}
      />
    ) : (
      <InitGame
        setRoom={setRoom}
        setOrientation={setOrientation}
        setPlayers={setPlayers}
      />
    )
  );
}
