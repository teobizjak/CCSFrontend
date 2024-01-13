import { useState, useEffect, useCallback } from 'react';
import Game from '../components/game';
import socket from './socket';
import InitGame from '../components/initGame';
import { useLocation } from 'react-router-dom';


export default function GamePage() {
  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [players, setPlayers] = useState([]);
  const location = useLocation();
  const bet = location.state?.bet || 0.01;
  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers([]);
  }, []);
  
  useEffect(() => {
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
        bet={bet}
        setOrientation={setOrientation}
        setPlayers={setPlayers}
      />
    )
  );
}
