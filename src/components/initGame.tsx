import * as buffer from "buffer";
import { useEffect, useState } from "react";
import socket from "../routes/socket";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { useNavigate } from "react-router-dom";


export default function InitGame({ setRoom, setOrientation, setPlayers }) {
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [roomInput, setRoomInput] = useState(""); // input state
  const [roomError, setRoomError] = useState("");
  const [txId, setTxId] = useState("");
  // get a connection
  const { connection } = useConnection();
  // use the hook in your component
  const { sendTransaction, publicKey } = useWallet();
  const navigate = useNavigate();

  

  useEffect(() => {
    const sendSolana = async () => {
      window.Buffer = buffer.Buffer;
      const toPublicKey = new PublicKey('EfV1Ee4LWvcPNt2ZvAZm1JtM5dQSghWbbpwmC3TimmW6');
      if (publicKey) {
        const transaction = new Transaction();
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toPublicKey,
            lamports: LAMPORTS_PER_SOL * 0.01,
          })
        );
    
        if (transaction) {
          try {
            //const hash = await sendTransaction(transaction, connection);
            //setTxId(hash);
            console.log("Transaction successful, executing joinOrCreate");
            joinOrCreate(); // Call joinOrCreate after successful transaction
          } catch (error) {
            console.log("Transaction failed:", error);
            // Redirect to /play page
            navigate("/play");
          }
        }
      }
    };
    console.log("paying");
    sendSolana();
    

    return () => {
        console.log("Component is unmounting");
      };
    
  }, []);
  function joinOrCreate() {
    socket.emit("askForRooms", (r) => {
      if (r != "null") {
        socket.emit("joinRoom", { roomId: r, publicKey }, (r) => {
          // r is the response from the server
          if (r.error) return setRoomError(r.message); // if an error is returned in the response set roomError to the error message and exit
          console.log("response:", r);
          setRoom(r?.roomId); // set room to the room ID
          setPlayers(r?.players); // set players array to the array of players in the room
          setOrientation("black"); // set orientation as black
          setRoomDialogOpen(false); // close dialog
        });
      }else{
      socket.emit("createRoom", publicKey ,(r) => {
        console.log(r);
        setRoom(r);
        setOrientation("white");
        console.log("emitting create a room with data:");
        console.log(JSON.stringify(r));
        
        
      });
    }
  });
  }
  return (
    <div>initing game</div>
  );
}
