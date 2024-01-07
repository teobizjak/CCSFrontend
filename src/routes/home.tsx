import { useNavigate } from "react-router-dom";
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from "react";
import axios from "axios";


function Home() {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  axios.defaults.baseURL = 'http://localhost:8081';
  // Replace this with your wallet name

  const walletName = publicKey ? publicKey.toBase58().slice(0, 8) + '...' : "please connect wallet";
  const streak = "WWLDWLW";

  const [games, setGames] = useState([]);

  useEffect(() => {
    const userId = 'yourUserId'; // Replace with the actual userId
    console.log(`getting games from ${publicKey}`);
    
    axios.get(`/games/${publicKey}`)
      .then(response => {
        setGames(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);
  // Replace this with your previous games data
  const previousGames = [
    {
      opponent: "0x1234abcd",
      yourColor: "red",
      result: "W",
      reward: 10,
    },
    {
      opponent: "0x5678efgh",
      yourColor: "blue",
      result: "L",
      reward: 0,
    },
    {
      opponent: "0x9abcijkl",
      yourColor: "green",
      result: "D",
      reward: 5,
    },
  ];

  // Handle the click event of the play button
  const handlePlay = () => {
    // Add your logic here
    console.log("Play the game");
    navigate("/play");
  };

  // Handle the click event of the claim reward button
  const handleClaim = (reward) => {
    // Add your logic here
    console.log(`Claim ${reward} tokens`);
  };

  return (
    <div className="h-full w-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen bg-purple-100">
        <h1 className="text-4xl font-bold text-center py-8">
          Welcome, {walletName}
        </h1>
        <p className="text-2xl font-medium text-center">Your streak: {streak}</p>
        <button
          className="block mx-auto my-8 px-12 py-4 bg-green-500 text-white text-2xl font-bold rounded-lg"
          onClick={handlePlay}
        >
          Play the game
        </button>
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="border p-4">Opponent</th>
              <th className="border p-4">Your color</th>
              <th className="border p-4">Result</th>
              <th className="border p-4">Claim reward</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr key={index}>
                <td className="border p-4">{ game.white === publicKey ? game.black.slice(0, 8) : game.white.slice(0, 8)}...</td>
                <td className="border p-4">{ game.white === publicKey ? "white" : "black" }</td>
                <td className="border p-4">{ game.winner === "Draw" ? "D": game.winner === "white" && game.white === publicKey ? "Win" : "Defeat"}</td>
                <td className="border p-4">
                  {game.result != "L" &&
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    onClick={() => handleClaim(5)}
                  >
                    Claim 5 tokens
                  </button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;

