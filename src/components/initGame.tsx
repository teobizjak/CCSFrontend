import * as buffer from "buffer";
import { useEffect, useState } from "react";
import socket from "../routes/socket";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { useLocation, useNavigate } from "react-router-dom";


export default function InitGame({ setRoom, setOrientation, setPlayers, bet }) {
  const [roomError, setRoomError] = useState("");
  const [txId, setTxId] = useState("");
  const [initMessage, setInitMessage] = useState("");
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  

  useEffect(() => {

    
    const sendSolana = async () => {
      window.Buffer = buffer.Buffer;
      const toPublicKey = new PublicKey('4oxxEgtzADmgo3VH3aG2Hv2voUtoXGSisou8PGoqKCpD');
      if (publicKey) {
        const transaction = new Transaction();
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toPublicKey,
            lamports: LAMPORTS_PER_SOL * bet,
          })
        );
          try {
            if (true) {
              joinGame(0.01, "asdf");
            }else{

            
            setInitMessage("Awaiting payment...");
            const hash = await sendTransaction(transaction, connection);
            setInitMessage("Payment success...");
            setTxId(hash);
            console.log("txID", txId);
            setInitMessage("Verifying payment...(this step usualy takes up to 10 seconds)");
            const signatureStatus = await connection.confirmTransaction(hash, 'confirmed');
            console.log('Signature status:', signatureStatus);
            if (signatureStatus){
              setInitMessage("Joining game...");
              console.log("Transaction successful, executing joinOrCreate");
              joinGame(bet, txId); // Call joinOrCreate after successful transaction
            }else{
              navigate("/play");
            }
          }
            
          } catch (error) {
            console.log("Transaction failed:", error);
            // Redirect to /play page
            navigate("/play");
          }
        
      }
    };
    console.log("paying");
    sendSolana();
    

    return () => {
        console.log("Component is unmounting");
      };
    
  }, []);
  function joinGame(bet, txId){
    const token = localStorage.getItem(`token-${publicKey.toString()}`);
    const data = {bet, publicKey, token, txId}
    socket.emit("joinGame", data , (r) => {
      console.log("response from server for joingame", r);
      
      if (r?.orientation === "white") {
        setRoom(r?.roomId);
        setOrientation(r?.orientation);
      }else if (r?.orientation === "black") {
        setRoom(r?.roomId);
        setPlayers(r?.players);
        setOrientation(r?.orientation);
      }
      
    })
  }
  function joinOrCreate(betAmount) {
    const token = localStorage.getItem(`token-${publicKey.toString()}`);
    const data = {bet: betAmount, wallet: publicKey, token}
    socket.emit("askForRooms", data , (r) => {
      if (r !== "null") {
        socket.emit("joinRoom", { roomId: r, publicKey, token }, (r) => {
          // r is the response from the server
          if (r.error) return setRoomError(r.message); // if an error is returned in the response set roomError to the error message and exit
          console.log("response:", r);
          setRoom(r?.roomId); // set room to the room ID
          setPlayers(r?.players); // set players array to the array of players in the room
          setOrientation("black"); // set orientation as black
        });
      }else{
      let data = {publicKey, betAmount, token}
      socket.emit("createRoom", data ,(r) => {
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
    <div>{initMessage && initMessage}</div>
  );
}
