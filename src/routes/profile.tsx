import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const { publicKey } = useWallet();
  // Replace this with your wallet name
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

    const walletName = publicKey ? publicKey.toBase58().slice(0, 30) + '...' : "please connect wallet";
    
  const [streak, setStreak] = useState("");
  const [limit, setLimit] = useState(5);
  const [games, setGames] = useState([]);

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    walletAccount: publicKey?.toBase58(),
    won: 0,
    drawn: 0,
    lost: 0,
    paid: 0,
    winnings: 0,
    elo: 300
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/user/${publicKey}`);
        const userData = response.data;
        setUser(prevUser => ({
          ...prevUser,
          ...userData
        }));
        
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchData();
  }, [publicKey]); 

  
  function loadMore(){
    setLimit(limit + 5)
  }

  useEffect(() => {
    console.log(`getting games from ${publicKey}`);
    
    axios.get(`/games/${publicKey}`, {
      params: {
        results: limit
      }
    })
    
      .then(response => {
        let sortedGames = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setGames(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });

  }, [limit, publicKey]);
  useEffect(() => {
    let str = "";
    games.map((game, index) => {
      let result;
      if (game.winner === "draw") {
        result = "Draw";
        str += "D";
      } else if ((game.winner === "white" && game.white === publicKey?.toBase58()) || (game.winner === "black" && game.black === publicKey?.toBase58())) {
        result = "Win";
        str += "W";
      } else {
        result = "Defeat";
        str += "L";
      }
      if (str.length > 5) {
        str = str.slice(0, 5);
      }
    });
    setStreak(str);
  }, [games]);

      const handlePlay = () => {
        // Add your logic here
        console.log("Play the game");
        console.log(JSON.stringify(user));
        
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
        <div className="mt-4 text-2xl font-bold text-gray-900">{user.firstName ? user.firstName : "no name"} {user.lastName ? user.lastName : "no last name"} {"("+user.elo+")"}</div>
        <div className="mt-2 text-lg text-gray-700">{user.walletAccount}</div>
        <div className="mt-4 flex space-x-4">
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Wins</div>
            <div className="text-xl text-gray-900">{user.won}</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Draws</div>
            <div className="text-xl text-gray-900">{user.drawn}</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Defeats</div>
            <div className="text-xl text-gray-900">{user.lost}</div>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Money paid</div>
            <div className="text-xl text-gray-900">{user.paid} SOL</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Money earned</div>
            <div className="text-xl text-gray-900">{user.winnings} SOL</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Profit</div>
            <div className="text-xl text-gray-900">{user.winnings - user.paid} SOL</div>
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
      {games.map((game, index) => {
        let result;
        if (game.winner === "draw") {
          result = "Draw";
        } else if (game.winner === "white" && game.white === publicKey?.toBase58()) {
          result = "Win";
        } else if (game.winner === "black" && game.black === publicKey?.toBase58()) {
          result = "Win";
        } else {
          result = "Defeat";
        }

        let opponent = game.white === publicKey?.toBase58() ? game.black : game.white;
        opponent = opponent ? opponent.slice(0, 8) : "none";
        let colorTxId = game.white === publicKey?.toBase58() ? "whiteTxnId" : "blackTxnId";

        return (
          <tr key={index}>
            <td className="border p-4">{opponent}...</td>
            <td className="border p-4">{game.white === publicKey?.toBase58() ? "white" : "black" }</td>
            <td className="border p-4">{result}</td>
            <td className="border p-4">
              {result !== "Defeat" ?
              game[colorTxId] ? <a href={"https://explorer.solana.com/tx/" + game[colorTxId] + "?cluster=devnet"} target="blank">{"Claimed: "+game[colorTxId].slice(0,8)+"..."}</a>  :
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => handleClaim(game.roomId)}
              >
                {result === "Win" ? "Claim " + game.betAmount*1.95 + " SOL" : result === "Draw" ? "Claim " + game.betAmount*0.95 + " SOL" : ""}
              </button>
              : <span className=" cursor-default">You lost</span>
              }
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
  {games.length === 0 ? <div className=" w-fit mx-auto mt-4">You haven't played any games</div> :<div className=" w-fit mx-auto mt-4" onClick={loadMore}>Load more</div>}
        </div>
      </div>
    </div>
  );
}

export default Profile;
