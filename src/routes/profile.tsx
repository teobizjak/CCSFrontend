import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../components/editProfileModal';
import ProfilePhoto from '../components/profilePhoto';
import socket from './socket';
import ResultsTable from '../components/resultsTable';

function Profile() {
    const navigate = useNavigate();
    const { publicKey } = useWallet();
  // Replace this with your wallet name
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;

    const walletName = publicKey ? publicKey.toBase58().slice(0, 30) + '...' : "please connect wallet";
    
  const [streak, setStreak] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
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
        let sortedGames = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
          let sortedGames = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setGames(response.data);
      
          sortedGames.map((game, index) => {
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
        })
        .catch(error => {
          console.error('Error:', error);
        });
        let str = "";
      };
    
      // Handle the click event of the claim reward button
      const handleClaim = (roomId) => {
        // Add your logic here
        console.log(`Claim ${roomId}`);
        //for refreshing purposes
        axios.post(`/claim/${roomId}`)
          .then(response => {
            console.log("response: ", response.data);
            fetchData();
            fetchUserData();
            
          })
          .catch(error => {
            console.error('Error:', error);
          });
          
        
      };
  return (
    <div className="h-full w-full bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen bg-purple-100 relative">
    {isEditOpen && (
      <EditProfileModal setIsEditOpen={setIsEditOpen} user={user} setUser={setUser} axios={axios} publicKey={publicKey}/>
        
      )}
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
        <div className="mt-4 flex space-x-4">
          <button className="bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800" onClick={() => setIsEditOpen(true)}>Edit profile</button>
            <button className="bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800" onClick={handlePlay}>Play new game</button>
          </div>
         <ResultsTable games={games} handleClaim={handleClaim} publicKey={publicKey} loadMore={loadMore}/>
        </div>
      </div>
    </div>
  );
}

export default Profile;
