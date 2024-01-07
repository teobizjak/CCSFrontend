import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const { publicKey } = useWallet();
  // Replace this with your wallet name

    const walletName = publicKey ? publicKey.toBase58().slice(0, 30) + '...' : "please connect wallet";
    const wins = 3;
    const draws = 5;
    const loses = 7;

    const moneyPaid = 0.2;
    const moneyEarned = 0.23;

    // Replace this with your player's streak
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
      <div className="flex flex-col items-center justify-center h-full">
        <div className="rounded-full border-4 border-purple-900 w-32 h-32 overflow-hidden">
          <img src="profile.jpg" alt="Profile picture" className="w-full h-full object-cover" />
        </div>
        <div className="mt-4 text-2xl font-bold text-gray-900">John Doe</div>
        <div className="mt-2 text-lg text-gray-700">{walletName}</div>
        <div className="mt-4 flex space-x-4">
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Wins</div>
            <div className="text-xl text-gray-900">{wins}</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Draws</div>
            <div className="text-xl text-gray-900">{draws}</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Loses</div>
            <div className="text-xl text-gray-900">{loses}</div>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Money paid</div>
            <div className="text-xl text-gray-900">{moneyPaid} SOL</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Money earned</div>
            <div className="text-xl text-gray-900">{moneyEarned} SOL</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Profit</div>
            <div className="text-xl text-gray-900">{moneyEarned - moneyPaid} SOL</div>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Money ready to be redeemed</div>
            <div className="text-xl text-gray-900">$50</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Games under review</div>
            <div className="text-xl text-gray-900">2</div>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <button className="bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800">Edit profile</button>
            <button className="bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800" onClick={handlePlay}>Play new game</button>
          </div>
          <table className="w-full text-center border-collapse mt-4">
          <thead>
            <tr>
              <th className="border p-4">Opponent</th>
              <th className="border p-4">Your color</th>
              <th className="border p-4">Result</th>
              <th className="border p-4">Claim reward</th>
            </tr>
          </thead>
          <tbody>
            {previousGames.map((game, index) => (
              <tr key={index}>
                <td className="border p-4">{game.opponent}</td>
                <td className="border p-4">{game.yourColor}</td>
                <td className="border p-4">{game.result}</td>
                <td className="border p-4">
                  {game.result != "L" &&
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    onClick={() => handleClaim(game.reward)}
                  >
                    Claim {game.reward} tokens
                  </button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default Profile;
