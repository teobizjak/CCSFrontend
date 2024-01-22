import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfilePhoto from '../components/profilePhoto';
import socket from './socket';
import ResultsTable from '../components/resultsTable';

function UserProfile() {
    const navigate = useNavigate();
    const { publicKey } = useParams();
  // Replace this with your wallet name
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

  const [streak, setStreak] = useState("");
  const [limit, setLimit] = useState(5);
  const [games, setGames] = useState([]);
  

  const analyze = (roomId) =>{
    navigate(`/analyzeGame/${roomId}`)
  }


  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    walletAccount: publicKey,
    won: 0,
    drawn: 0,
    lost: 0,
    paid: 0,
    winnings: 0,
    elo: 300,
    picture: "avatar",
    readyToRedeem:0,
    gamesUnderReview:0
  });

  const fetchUserData = async () => {
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
    try {
      const response = await axios.get(`/userGamesData/${publicKey}`);
      const userData = response.data;
      setUser(prevUser => ({
        ...prevUser,
        ...userData
      }));
      
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };


  useEffect(() => {
    if (!publicKey) return;
    fetchData();
    fetchUserData();
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
        setGames(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });

  }, [limit, publicKey]);
  useEffect(() => {
    if (publicKey) {
      socket.emit("updateUserToken", publicKey, (r) => {
        console.log(r);
        localStorage.setItem('token', r);
        console.log("token is");
        
        console.log(localStorage.getItem("token"));
        
      });
    }
  }, []);
  useEffect(() => {
    let str = "";
    games.map((game, index) => {
      let result;
      if (game.winner === "draw") {
        result = "Draw";
        str += "D";
      } else if ((game.winner === "white" && game.white === publicKey) || (game.winner === "black" && game.black === publicKey)) {
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
        navigate("/play");
        
      };
      const fetchData = () => {
        console.log(`getting games from ${publicKey}`);
        
        axios.get(`/games/${publicKey}`, {
          params: {
            results: limit
          }
        })
        .then(response => {
          setGames([]);
          setGames(response.data);
      
          response.data.map((game, index) => {
            let result;
            if (game.winner === "draw") {
              result = "Draw";
              str += "D";
            } else if ((game.winner === "white" && game.white === publicKey) || (game.winner === "black" && game.black === publicKey)) {
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
        })
        .catch(error => {
          console.error('Error:', error);
        });
        let str = "";
      };
  return (
    <div className="h-full w-full bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen bg-purple-100 relative">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="rounded-full border-4 border-purple-900 w-32 h-32 overflow-hidden">
        <ProfilePhoto src={user.picture} className="w-full h-full object-cover" />
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
            <div className="text-xl text-gray-900">{user.paid.toFixed(2)} SOL</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Money earned</div>
            <div className="text-xl text-gray-900">{user.winnings.toFixed(4)} SOL</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Profit</div>
            <div className="text-xl text-gray-900">{(user.winnings - user.paid).toFixed(4)} SOL</div>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Money ready to be redeemed</div>
            <div className="text-xl text-gray-900">{user.readyToRedeem}</div>
          </div>
          <div className="bg-purple-200 p-2 rounded-lg">
            <div className="text-sm text-gray-600">Games under review</div>
            <div className="text-xl text-gray-900">{user.gamesUnderReview}</div>
          </div>
        </div>
          <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="border p-4">Opponent</th>
              <th className="border p-4">Your color</th>
              <th className="border p-4">Result</th>
              <th className="border p-4">Claim reward</th>
              <th className="border p-4">Options</th>
            </tr>
          </thead>
          <tbody>
      {games.map((game, index) => {
        let result;
        if (game.winner === "draw") {
          result = "Draw";
        } else if (game.winner === "white" && game.white === publicKey) {
          result = "Win";
        } else if (game.winner === "black" && game.black === publicKey) {
          result = "Win";
        } else {
          result = "Defeat";
        }

        let opponent = game.white === publicKey ? game.black : game.white;
        let opponentSliced = opponent ? opponent.slice(0, 8) : "none";
        let colorTxId = game.white === publicKey ? "whiteTxnId" : "blackTxnId";

        return (
          <tr key={index}>
            <td className="border p-4 cursor-pointer" onClick={() =>{navigate(`/profile/${opponent}`)}}>{opponentSliced}...</td>
            <td className="border p-4">{game.white === publicKey ? "white" : "black" }</td>
            <td className="border p-4">{result}</td>
            <td className="border p-4">
              {result !== "Defeat" ?
              game[colorTxId] ? <a href={"https://explorer.solana.com/tx/" + game[colorTxId] + "?cluster=devnet"} target="blank">{"Claimed: "+game[colorTxId].slice(0,8)+"..."}</a>  :
              <span>Awaiting claim</span>
              : <span className=" cursor-default">You lost</span>
              }
            </td>
            <td className="border p-4"><button onClick={() => analyze(game.roomId)}>Analyze</button></td>
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

export default UserProfile;
