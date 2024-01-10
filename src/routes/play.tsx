import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useNavigate } from "react-router-dom";

function Play() {
  const navigate = useNavigate();
  // Replace this with your wallet address
  const { publicKey } = useWallet();
  // Replace this with your wallet name

  const walletName = publicKey ? publicKey.toBase58().slice(0, 8) + '...' : "please connect wallet";

  // Replace this with your available balance
  const [balance, setBalance] = useState(0);
  const {connection} = useConnection();
  

  const fetchBalance = async () => {
    if(publicKey && connection){      
      const balanceInLamports = await connection.getBalance(publicKey, "confirmed");
      if (balanceInLamports) {
        // Convert the balance from lamports to SOL and round it to 3 decimal places
        const balanceInSol = Math.round((balanceInLamports / 1e9) * 1000) / 1000;
        setBalance(balanceInSol);
      }
    }
  };
  
  

  useEffect(() => {
    fetchBalance();
  }, [publicKey, connection]);

  // rest of your code...

  // The bet options in SOL
  const betOptions = [0.01, 0.05, 0.07, 0.1];

  // The selected bet amount
  const [bet, setBet] = useState(betOptions[0]);

  // Handle the change event of the bet selector
  const handleChange = (event) => {
    setBet(event.target.value);
  };

  // Handle the click event of the play button
  const handlePlay = () => {
    // Add your logic here

    console.log(`Play with ${bet} SOL`);
    navigate('/game', { state: { bet: bet } });
  };

  return (
    <div className="h-full w-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen bg-purple-100">
        <div className="flex justify-between items-center py-8">
          <h1 className="text-4xl font-bold text-center">CryptoChess</h1>
          <p className="text-2xl font-medium text-right">
            Wallet: {walletName}
          </p>
        </div>
        <div className="flex flex-col-reverse md:flex-row justify-between items-center">
          <div className="w-full md:w-1/2 h-auto bg-gray-200 border-4 border-black">
            <Chessboard arePiecesDraggable={false} position="start" />
          </div>
          <div className="w-full md:w-1/2 h-96 flex flex-col justify-center items-center">
            <p className="text-2xl font-medium">Balance: {balance} SOL</p>
            <select
              className="my-4 px-4 py-2 bg-white text-2xl font-medium border-2 border-black rounded-lg"
              value={bet}
              onChange={handleChange}
            >
              {betOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option} SOL
                </option>
              ))}
            </select>
            <button
              className="px-12 py-4 bg-green-500 text-white text-2xl font-bold rounded-lg"
              onClick={handlePlay}
            >
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Play;
