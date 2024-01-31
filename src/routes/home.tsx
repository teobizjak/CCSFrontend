import { useNavigate } from "react-router-dom";
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "./socket";
import ResultsTable from "../components/resultsTable";
import { getUserData } from "../functions/getUser";



function Home() {

  interface UserData {
    createdAt?: string;
    drawn?: number;
    elo?: number;
    eloK?: number;
    firstName?: string;
    lastName?: string;
    lost?: number;
    paid?: number;
    siteTitle?: string;
    title?: string;
    picture?: string;
    reported?: number;
    updatedAt?: string;
    walletAddress?: string;
    winnings?: number;
    won?: number;
  }

  const navigate = useNavigate();
  const { publicKey } = useWallet();
  axios.defaults.baseURL = process.env.REACT_APP_API_CONNECTION;
  // Replace this with your wallet name

  const walletName = publicKey ? publicKey.toBase58().slice(0, 8) + '...' : "please connect wallet";
  const [streak, setStreak] = useState("");
  const [limit, setLimit] = useState(5);
  const [games, setGames] = useState([]);
  const [userData, setUserData] = useState<UserData>({});
  
  function loadMore(){
    setLimit(limit + 5)
  }
  
  const fetchData = () => {
    console.log(`getting games from ${publicKey}`);
    
    axios.get(`/games/${publicKey}`, {
      params: {
        results: limit
      }
    })
    .then(response => {
      setGames([]);
      let sortedGames = [...response.data.games].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setGames(response.data.games);
      if (response.data.games.length < 10) {
        
      }
  
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
  
  
  useEffect(() => {
    async function fetchUserData() {
      const data = await getUserData(publicKey?.toBase58()); // Passing userId as a parameter
      console.log("userData", data);
      
      setUserData(data);
    }
    if (publicKey) {
      fetchUserData()
      socket.emit("updateUserToken", publicKey, (r) => {
        console.log(r);
        localStorage.setItem('token', r);
        console.log("token is");
        
        console.log(localStorage.getItem("token"));
        
      });
    }
  }, []);
  useEffect(() => {
    async function checkSiteTitle() {
      
    
    const { drawn, won, lost, siteTitle } = userData;
    if (publicKey && won && drawn && lost && siteTitle === undefined) {
      const totalGames = drawn + won + lost;
      if (totalGames <= 10 ) {
        // Execute something here if total of drawn, won, and lost is not more than 10
        const response = await axios.put(`/updateSiteTitle/${publicKey?.toBase58()}`);
    console.log('Success:', response.data);
        // Place your code for the action you want to execute here
      } else {
        console.log("Total games are more than 10, not executing the action.");
      }
    }else if (publicKey && siteTitle === undefined) {
      const response = await axios.put(`/updateSiteTitle/${publicKey?.toBase58()}`);
    }
  }
  checkSiteTitle();
  

  
  }, [userData]);
  
  
  useEffect(() => {
    fetchData();
    
  }, [limit, publicKey]);
  
  // Handle the click event of the play button
  const handlePlay = () => {
    // Add your logic here
    console.log("Play the game");
    navigate("/play");
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
        
      })
      .catch(error => {
        console.error('Error:', error);
      });
    
  };
  function chkw(){
    console.dir(publicKey);
    
  }

  return (
    <div className="h-full w-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen bg-purple-100">
        <h1 className="text-4xl font-bold text-center py-8">
          Welcome, {walletName}
        </h1>

        
        {streak === "" ? "" : <p className="text-2xl font-medium text-center">{streak.split('').map((char, index) => {
        let color;
        switch(char) {
          case 'W':
            color = 'text-green-500';
            break;
          case 'D':
            color = 'text-gray-500';
            break;
          case 'L':
            color = 'text-red-500';
            break;
          default:
            color = 'text-black';
        }

        return (
          <span key={index} className={color}>
            {char}
          </span>
        );
      })}</p>}
        
        <button
          className="block mx-auto my-8 px-12 py-4 bg-green-500 text-white text-2xl font-bold rounded-lg"
          onClick={handlePlay}
        >
          Play the game
        </button>
        <ResultsTable games={games} handleClaim={handleClaim} publicKey={publicKey} loadMore={loadMore}/>
         </div>
    </div>
  );
}

export default Home;

