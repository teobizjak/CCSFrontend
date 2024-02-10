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
        if (true) {
          joinGame(bet, "empty");
        }else{

        
          try {
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
              joinGame(bet, hash); // Call joinOrCreate after successful transaction
            }else{
              navigate("/play");
            }
            
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
  
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      {initMessage && <div className="init-message">{initMessage}</div>}
    </div>

  );
}
